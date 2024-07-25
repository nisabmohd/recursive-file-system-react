"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
} from "lucide-react";
import { File, Folder, Struct } from "./file-system";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RestProps = {
  prefix?: string;
  handleAdd: (prefix: string, name: string, type: Category) => void;
  handleRemove: (prefix: string) => void;
  handleRename: (prefix: string, newName: string) => void;
};

type Category = "file" | "folder";

export default function Node({
  dir,
  prefix = "",
  ...rest
}: { dir: Struct } & RestProps) {
  return (
    <ul className="flex flex-col gap-3 pl-6 pt-2">
      {dir.map((it) => (
        <FolderOrFile
          key={it.name}
          item={it}
          prefix={prefix == "" ? it.name : prefix + "/" + it.name}
          {...rest}
        />
      ))}
    </ul>
  );
}

function FolderOrFile({
  item,
  prefix,
  ...rest
}: {
  item: Folder | File;
} & RestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleOpen = () => setIsOpen((prev) => !prev);
  const [dialogStates, setDialogStates] = useState({
    add: false,
    rename: false,
  });
  const [selectedType, setSelectedType] = useState<"file" | "folder">();
  const { handleAdd, handleRemove, handleRename } = rest;

  return (
    <>
      <li title={prefix}>
        <ContextMenu>
          <ContextMenuTrigger onClick={handleToggleOpen} asChild>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-4">
                {item.type === "folder" &&
                  (!isOpen ? (
                    <ChevronRightIcon className="w-4 h-4 cursor-pointer" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 cursor-pointer" />
                  ))}
              </div>

              {item.type === "folder" ? (
                <FolderIcon className="w-5 h-5 text-yellow-500 fill-current" />
              ) : (
                <FileIcon className="w-5 h-5 text-blue-500 fill-current" />
              )}

              {item.name}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {item.type === "folder" && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    setDialogStates((prev) => ({ ...prev, add: true }));
                    setSelectedType("folder");
                  }}
                >
                  Add folder
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setDialogStates((prev) => ({ ...prev, add: true }));
                    setSelectedType("file");
                  }}
                >
                  Add file
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem
              onClick={() => {
                handleRemove(prefix!);
              }}
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                setDialogStates((prev) => ({ ...prev, rename: true }));
              }}
            >
              Rename
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {item.type === "folder" && item.items && isOpen && (
          <Node dir={item.items} prefix={prefix} {...rest} />
        )}
      </li>
      <RenameDialog
        currentName={item.name}
        isOpen={dialogStates.rename}
        onSave={(val) => {
          handleRename(prefix!, val);
          setDialogStates((prev) => ({ ...prev, rename: false }));
        }}
        handleOpen={(val) =>
          setDialogStates((prev) => ({ ...prev, rename: val }))
        }
      />
      {selectedType && (
        <AddDilaog
          type={selectedType}
          isOpen={dialogStates.add}
          onSave={(val) => {
            handleAdd(prefix!, val, selectedType);
            setDialogStates((prev) => ({ ...prev, add: false }));
            setIsOpen(true);
          }}
          handleOpen={(val) =>
            setDialogStates((prev) => ({ ...prev, add: val }))
          }
        />
      )}
    </>
  );
}

export function FileSystemModule({ struct }: { struct: Struct }) {
  const [data, setData] = useState(struct);

  function handleAdd(prefix: string, name: string, type: Category) {
    const paths = prefix.split("/");
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    paths.forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        if (!something.items) something.items = [];
        temp = something.items;
      }
    });
    temp.push({ name, type });
    setData(newdata);
  }

  function handleRename(prefix: string, newName: string) {
    const paths = prefix.split("/");
    if (paths.length == 1) {
      const copydata = [...data];
      const something = data.find((it) => it.name == paths[0])!;
      something.name = newName;
      setData(copydata);
      return;
    }
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    const name = paths.at(-1)!;
    paths.slice(0, paths.length - 1).forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        temp = something.items ?? [];
      }
    });
    const something = temp.find((it) => it.name == name)!;
    something.name = newName;
    temp.splice(0, temp.length, ...temp);
    setData(newdata);
  }

  function handleDelete(prefix: string) {
    const paths = prefix.split("/");
    if (paths.length == 1) {
      const newData = data.filter((it) => it.name != paths[0]);
      setData(newData);
      return;
    }
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    const name = paths.at(-1)!;
    paths.slice(0, paths.length - 1).forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        temp = something.items ?? [];
      }
    });
    const filtered = temp.filter((it) => it.name != name);
    temp.splice(0, temp.length, ...filtered);
    setData(newdata);
  }

  return (
    <Node
      dir={data}
      handleAdd={handleAdd}
      handleRemove={handleDelete}
      handleRename={handleRename}
    />
  );
}

function RenameDialog({
  onSave,
  isOpen,
  currentName,
  handleOpen,
}: {
  isOpen: boolean;
  handleOpen: (val: boolean) => void;
  onSave: (name: string) => void;
  currentName: string;
}) {
  const [name, setName] = useState(currentName);
  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename it to something else</DialogTitle>
          <DialogDescription>
            Make changes to your file or folder name here. Click save when youre
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">New name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="name"
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button disabled={!name} onClick={() => onSave(name)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddDilaog({
  onSave,
  isOpen,
  handleOpen,
  type,
}: {
  isOpen: boolean;
  handleOpen: (val: boolean) => void;
  type: Category;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new {type} </DialogTitle>
          <DialogDescription>Add new {type} into your dir</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">New name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="name"
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button disabled={!name} onClick={() => onSave(name)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
