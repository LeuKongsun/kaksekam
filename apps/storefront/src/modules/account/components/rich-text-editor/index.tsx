"use client"

import { sanitizeRichText } from "@lib/util/rich-text"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useState } from "react"

type RichTextEditorProps = {
  label: string
  name: string
  defaultValue?: string | null
  required?: boolean
}

const toolbarButtons = [
  { label: "Bold", isActive: "bold", run: "toggleBold", icon: <BoldIcon /> },
  {
    label: "Italic",
    isActive: "italic",
    run: "toggleItalic",
    icon: <ItalicIcon />,
  },
  {
    label: "Bulleted list",
    isActive: "bulletList",
    run: "toggleBulletList",
    icon: <BulletListIcon />,
  },
  {
    label: "Numbered list",
    isActive: "orderedList",
    run: "toggleOrderedList",
    icon: <NumberedListIcon />,
  },
] as const

const RichTextEditor = ({
  label,
  name,
  defaultValue,
  required,
}: RichTextEditorProps) => {
  const [value, setValue] = useState(() => sanitizeRichText(defaultValue))
  const [, setRenderKey] = useState(0)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder:
          "Describe the product, condition, quantity, and pickup details.",
      }),
    ],
    content: sanitizeRichText(defaultValue),
    editorProps: {
      attributes: {
        "aria-multiline": "true",
        "aria-required": required ? "true" : "false",
        class:
          "min-h-[150px] w-full bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover [&_a]:text-ui-fg-interactive [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
      },
    },
    immediatelyRender: false,
    onSelectionUpdate: () => setRenderKey((key) => key + 1),
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : sanitizeRichText(editor.getHTML())

      setValue(html)
    },
  })

  useEffect(() => {
    if (editor) {
      const html = sanitizeRichText(defaultValue)
      editor.commands.setContent(html, { emitUpdate: false })
      setValue(html)
    }
  }, [defaultValue, editor])

  const toggleLink = () => {
    if (!editor) {
      return
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Paste a link", previousUrl ?? "")

    if (url === null) {
      return
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const clearFormatting = () => {
    if (!editor) {
      return
    }

    editor.chain().focus().unsetAllMarks().clearNodes().run()
  }

  return (
    <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
      <span>
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      <input type="hidden" name={name} value={value} />
      <div className="overflow-hidden rounded-md border border-ui-border-base bg-white focus-within:shadow-borders-interactive-with-active">
        <div className="flex flex-wrap gap-1 border-b border-ui-border-base bg-gray-50 px-2 py-2">
          {toolbarButtons.map((button) => (
            <button
              key={button.run}
              type="button"
              onClick={() => editor?.chain().focus()[button.run]().run()}
              disabled={!editor}
              aria-label={button.label}
              title={button.label}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-white hover:text-ui-fg-base disabled:cursor-not-allowed disabled:opacity-50 ${
                editor?.isActive(button.isActive)
                  ? "bg-white text-ui-fg-base shadow-sm"
                  : "text-ui-fg-subtle"
              }`}
            >
              {button.icon}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleLink}
            disabled={!editor}
            aria-label="Link"
            title="Link"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-ui-fg-subtle transition-colors hover:bg-white hover:text-ui-fg-base disabled:cursor-not-allowed disabled:opacity-50 ${
              editor?.isActive("link")
                ? "bg-white text-ui-fg-base shadow-sm"
                : "text-ui-fg-subtle"
            }`}
          >
            <LinkIcon />
          </button>
          <button
            type="button"
            onClick={clearFormatting}
            disabled={!editor}
            aria-label="Clear formatting"
            title="Clear formatting"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ui-fg-subtle transition-colors hover:bg-white hover:text-ui-fg-base disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ClearFormattingIcon />
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-ui-fg-muted [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        />
      </div>
    </label>
  )
}

function BoldIcon() {
  return (
  <span aria-hidden="true" className="font-bold leading-none">
    B
  </span>
  )
}

function ItalicIcon() {
  return (
  <span aria-hidden="true" className="font-serif italic leading-none">
    I
  </span>
  )
}

function BulletListIcon() {
  return (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 5h8M8 10h8M8 15h8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M4.5 5h.01M4.5 10h.01M4.5 15h.01"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
  )
}

function NumberedListIcon() {
  return (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 5h7M9 10h7M9 15h7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M4 4.2h1v3M3.8 7.2h2.2M3.8 10.2c0-.7.5-1.2 1.2-1.2s1.2.5 1.2 1.1c0 .5-.3.8-.8 1.2l-1.4 1h2.3M4 14.2c.2-.4.6-.7 1.1-.7.6 0 1 .4 1 .9 0 .4-.2.7-.6.8.5.1.8.4.8.9 0 .6-.5 1-1.2 1-.6 0-1-.2-1.3-.6"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  )
}

function LinkIcon() {
  return (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8.5 6.5 10 5a3.2 3.2 0 0 1 4.5 4.5L13 11M11.5 13.5 10 15a3.2 3.2 0 0 1-4.5-4.5L7 9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12 12 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
  )
}

function ClearFormattingIcon() {
  return (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 4h9M8.5 4 6.5 14M10.5 4 9 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="m11.5 12.5 4 4M15.5 12.5l-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
  )
}

export default RichTextEditor
