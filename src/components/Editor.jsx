import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { updateItem } from '../api';

const lowlight = createLowlight(common);

const WIKILINK_RE = /\[\[([a-f0-9-]{36})\|([^\]]+)\]\]/g;

function contentToHtml(content) {
  if (!content) return '<p></p>';
  let html = content;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(WIKILINK_RE, (_, id, title) => {
    return `<a data-wikilink href="#item-${id}" class="wikilink">${title}</a>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked />$1</label></li></ul>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox" />$1</label></li></ul>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  if (!html.startsWith('<')) html = `<p>${html}</p>`;
  return html;
}

function htmlToContent(html) {
  if (!html) return '';
  let content = html;
  content = content.replace(/<a[^>]*data-wikilink[^>]*href="#item-([^"]*)"[^>]*>([^<]*)<\/a>/g, (_, id, title) => {
    return `[[${id}|${title}]]`;
  });
  content = content.replace(/<br\s*\/?>/g, '\n');
  content = content.replace(/<\/p>\s*<p>/g, '\n\n');
  content = content.replace(/<\/h(\d)>\s*<h(\d)>/g, '\n\n');
  content = content.replace(/<\/h\d>/g, '\n');
  content = content.replace(/<h\d[^>]*>/g, (match) => {
    const level = match.match(/h(\d)/)?.[1];
    return '#'.repeat(parseInt(level || '2')) + ' ';
  });
  content = content.replace(/<strong>([^<]*)<\/strong>/g, '**$1**');
  content = content.replace(/<em>([^<]*)<\/em>/g, '*$1*');
  content = content.replace(/<del>([^<]*)<\/del>/g, '~~$1~~');
  content = content.replace(/<code>([^<]*)<\/code>/g, '`$1`');
  content = content.replace(/<hr\s*\/?>/g, '---');
  content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, '- $1');
  content = content.replace(/<[^>]+>/g, '');
  content = content.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/\n{3,}/g, '\n\n');
  return content.trim();
}

function contentToPreviewHtml(content, onNavigate) {
  if (!content) return '';
  let html = content;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(WIKILINK_RE, (_, id, title) => {
    return `<a class="wikilink" href="#" data-nav-id="${id}">${title}</a>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<div class="preview-task done"><input type="checkbox" checked disabled /> $1</div>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div class="preview-task"><input type="checkbox" disabled /> $1</div>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  if (!html.startsWith('<')) html = `<p>${html}</p>`;
  return html;
}

export default function Editor({ item, onNavigate }) {
  const [viewMode, setViewMode] = useState('edit');
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Start writing... use [[title]] to link notes' }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'wikilink' } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: contentToHtml(item.content),
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        doSave(editor.getHTML());
      }, 800);
    },
  }, [item.id]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const newHtml = contentToHtml(item.content);
      if (editor.getHTML() !== newHtml) {
        editor.commands.setContent(newHtml, false);
      }
    }
  }, [item.id]);

  useEffect(() => {
    setViewMode('edit');
  }, [item.id]);

  const doSave = async (html) => {
    setSaving(true);
    try {
      const content = htmlToContent(html);
      await updateItem(item.id, { content });
    } catch (e) {
      console.error('Save failed:', e);
    }
    setSaving(false);
  };

  const handleTitleBlur = (e) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateItem(item.id, { title: e.target.value });
    }, 300);
  };

  const handleTypeChange = async (e) => {
    await updateItem(item.id, { type: e.target.value });
  };

  const handleModeChange = async (e) => {
    await updateItem(item.id, { mode: e.target.value });
  };

  const handleStatusToggle = async () => {
    const newStatus = item.status === 'done' ? 'active' : 'done';
    await updateItem(item.id, { status: newStatus });
  };

  const handleTagsBlur = (e) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
      await updateItem(item.id, { tags });
    }, 300);
  };

  const handlePreviewClick = (e) => {
    const link = e.target.closest('a[data-nav-id]');
    if (link && onNavigate) {
      e.preventDefault();
      onNavigate(link.dataset.navId);
    }
  };

  const previewHtml = contentToPreviewHtml(item.content, onNavigate);

  if (!editor) return <div className="editor-loading">Loading editor...</div>;

  return (
    <div className="editor-area">
      <div className="editor-title-row">
        {item.type === 'task' && (
          <button
            className={`status-check ${item.status === 'done' ? 'checked' : ''}`}
            onClick={handleStatusToggle}
            title={item.status === 'done' ? 'Mark active' : 'Mark done'}
          >
            {item.status === 'done' ? '\u2713' : ''}
          </button>
        )}
        <input
          className="editor-title"
          defaultValue={item.title}
          onBlur={handleTitleBlur}
          placeholder="Untitled"
        />
      </div>

      <div className="editor-meta-row">
        <select className="meta-select" value={item.type} onChange={handleTypeChange}>
          <option value="note">Note</option>
          <option value="task">Task</option>
          <option value="idea">Idea</option>
          <option value="goal">Goal</option>
          <option value="problem">Problem</option>
          <option value="dream">Dream</option>
        </select>
        <select className="meta-select" value={item.mode} onChange={handleModeChange}>
          <option value="life">Life</option>
          <option value="learning">Learning</option>
          <option value="builder">Builder</option>
          <option value="money">Money</option>
          <option value="dream">Dream</option>
        </select>
        <span className={`meta-badge type-${item.type}`}>{item.type}</span>
        <span className={`meta-badge mode-${item.mode}`}>{item.mode}</span>
        {saving && <span className="saving-indicator">saving...</span>}
      </div>

      <div className="editor-view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
          onClick={() => setViewMode('edit')}
        >
          Edit
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
        >
          Preview
        </button>
      </div>

      {viewMode === 'edit' ? (
        <>
          <div className="editor-toolbar">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>I</button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''}>S</button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'active' : ''}>&lt;/&gt;</button>
            <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'active' : ''}>H</button>
            <span className="toolbar-sep" />
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>H3</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>UL</button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>OL</button>
            <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'active' : ''}>Task</button>
            <span className="toolbar-sep" />
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active' : ''}>Code</button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</button>
          </div>
          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        <div
          className="editor-preview"
          onClick={handlePreviewClick}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}

      <div className="editor-footer">
        <input
          className="editor-tags"
          defaultValue={item.tags.join(', ')}
          onBlur={handleTagsBlur}
          placeholder="Tags (comma separated)"
        />
      </div>
    </div>
  );
}