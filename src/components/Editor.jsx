import { useState, useEffect, useRef, useCallback } from 'react';
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

function contentToMarkdown(content, items) {
  if (!content) return '';
  let md = content;
  md = md.replace(WIKILINK_RE, (_, id, title) => {
    return `[$${title}$](${id})`;
  });
  return md;
}

function markdownToContent(md) {
  if (!md) return '';
  let content = md;
  content = content.replace(/\[\$([^\$]+)\$\]\(([^)]+)\)/g, (_, title, id) => {
    return `[[${id}|${title}]]`;
  });
  return content;
}

const WikilinkExtension = Link.extend({
  name: 'wikilink',
  addAttributes() {
    return {
      ...this.parent?.(),
      id: { default: null },
      href: { default: null },
      target: { default: '_self' },
    };
  },
  parseHTML() {
    return [{ tag: 'a[data-wikilink]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['a', { ...HTMLAttributes, 'data-wikilink': '', class: 'wikilink' }, 0];
  },
});

export default function Editor({ item, items, onUpdate, onNavigate }) {
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  const initialContent = contentToMarkdown(item.content, items);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Start writing... use [[ to link notes' }),
      WikilinkExtension.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        handleSave(editor.getMarkdown());
      }, 800);
    },
  }, [item.id]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const newContent = contentToMarkdown(item.content, items);
      if (editor.getMarkdown() !== newContent) {
        editor.commands.setContent(newContent || '');
      }
    }
  }, [item.id]);

  const handleSave = async (markdown) => {
    setSaving(true);
    const content = markdownToContent(markdown);
    await updateItem(item.id, { content });
    if (onUpdate) onUpdate();
    setSaving(false);
  };

  const handleTitleChange = async (e) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateItem(item.id, { title: e.target.value });
      if (onUpdate) onUpdate();
    }, 500);
  };

  const handleTypeChange = async (e) => {
    await updateItem(item.id, { type: e.target.value });
    if (onUpdate) onUpdate();
  };

  const handleModeChange = async (e) => {
    await updateItem(item.id, { mode: e.target.value });
    if (onUpdate) onUpdate();
  };

  const handleStatusToggle = async () => {
    const newStatus = item.status === 'done' ? 'active' : 'done';
    await updateItem(item.id, { status: newStatus });
    if (onUpdate) onUpdate();
  };

  const handleTagsChange = async (e) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    await updateItem(item.id, { tags });
    if (onUpdate) onUpdate();
  };

  if (!editor) return null;

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
          value={item.title}
          onChange={handleTitleChange}
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

      <div className="editor-content" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <div className="editor-footer">
        <input
          className="editor-tags"
          value={item.tags.join(', ')}
          onChange={handleTagsChange}
          placeholder="Tags (comma separated)"
        />
      </div>
    </div>
  );
}