"use client";

import { Tag } from "@/app/lib/DataContext";

interface TagPickerProps {
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
}

export default function TagPicker({ tags, selectedTagIds, onToggle }: TagPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => {
        const active = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              active ? "text-white border-transparent" : "border-slate-600 text-slate-400 hover:border-slate-400"
            }`}
            style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
