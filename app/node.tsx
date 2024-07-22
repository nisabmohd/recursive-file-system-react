"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
} from "lucide-react";
import { File, Folder, Struct } from "./file-system";
import { useState } from "react";

export default function Node({ dir }: { dir: Struct }) {
  return (
    <ul className="flex flex-col gap-3 pl-6 pt-2">
      {dir.map((it) => (
        <FolderOrFile key={it.name} item={it} />
      ))}
    </ul>
  );
}

function FolderOrFile({ item }: { item: Folder | File }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <li title={item.name}>
      <div className="flex items-center gap-2.5">
        <div className="w-4">
          {item.type === "folder" &&
            (!isOpen ? (
              <ChevronRightIcon
                onClick={handleToggleOpen}
                className="w-4 h-4 cursor-pointer"
              />
            ) : (
              <ChevronDownIcon
                onClick={handleToggleOpen}
                className="w-4 h-4 cursor-pointer"
              />
            ))}
        </div>

        {item.type === "folder" ? (
          <FolderIcon className="w-5 h-5 text-yellow-500 fill-current" />
        ) : (
          <FileIcon className="w-5 h-5 text-blue-500 fill-current" />
        )}

        {item.name}
      </div>
      {item.type === "folder" && item.items && isOpen && (
        <Node dir={item.items} />
      )}
    </li>
  );
}
