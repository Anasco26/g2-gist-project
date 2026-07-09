import { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ align: [] }],
  ["link", "image"],
  ["clean"],
];

export default function RichEditor({ value, onChange, placeholder = "Write your post content here..." }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const suppressRef = useRef(0);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: {
          container: TOOLBAR_OPTIONS,
          handlers: {
            image: imageHandler,
          },
        },
      },
      placeholder,
    });

    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    quillRef.current.on("text-change", () => {
      if (suppressRef.current > 0) return;
      const html = quillRef.current.root.innerHTML;
      onChange(html === "<p><br></p>" || html === "<br>" ? "" : html);
    });

    function imageHandler() {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const range = quillRef.current?.getSelection(true);
        const index = range?.index ?? 0;

        const formData = new FormData();
        formData.append("image", file);

          const token = localStorage.getItem("accessToken");
        try {
          const res = await fetch("/api/v1/upload", {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          const data = await res.json();
          if (data?.data?.url) {
            quillRef.current?.insertEmbed(index, "image", data.data.url);
            quillRef.current?.setSelection(index + 1, 0);
          }
        } catch {
          console.error("Image upload failed");
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    const normalized = value || "";
    if (normalized !== currentHtml) {
      suppressRef.current++;
      quillRef.current.root.innerHTML = normalized || "";
      setTimeout(() => suppressRef.current--, 0);
    }
  }, [value]);

  return (
    <div className="rich-editor-wrapper">
      <div ref={editorRef} />
    </div>
  );
}
