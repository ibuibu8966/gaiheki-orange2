"use client";

interface SimpleRichEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SimpleRichEditor = ({ value, onChange }: SimpleRichEditorProps) => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* エディタ（シンプルなテキストエリア） */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[500px] p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset text-gray-900 resize-y"
        style={{
          fontSize: "16px",
          lineHeight: "1.8",
        }}
        placeholder="本文を入力してください..."
      />
    </div>
  );
};

export default SimpleRichEditor;
