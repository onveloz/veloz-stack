"use client";

import { ChevronRight, FileCode2, FolderClosed, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProjectConfig } from "@veloz-stack/types";
import { generate } from "@veloz-stack/template-generator";

type TreeNode =
  | { kind: "file"; name: string; path: string }
  | { kind: "dir"; name: string; path: string; children: TreeNode[]; startOpen: boolean };

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  function insert(parts: string[], fullPath: string, parent: TreeNode[]) {
    const [head, ...rest] = parts;
    if (!head) return;
    if (rest.length === 0) {
      parent.push({ kind: "file", name: head, path: fullPath });
      return;
    }
    let dir = parent.find(
      (n) => n.kind === "dir" && n.name === head,
    ) as Extract<TreeNode, { kind: "dir" }> | undefined;
    if (!dir) {
      dir = {
        kind: "dir",
        name: head,
        path: fullPath.slice(0, fullPath.length - rest.join("/").length - 1),
        children: [],
        startOpen: true,
      };
      parent.push(dir);
    }
    insert(rest, fullPath, dir.children);
  }

  for (const p of paths) {
    insert(p.split("/"), p, root);
  }

  const sort = (nodes: TreeNode[]): TreeNode[] => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const n of nodes) {
      if (n.kind === "dir") sort(n.children);
    }
    return nodes;
  };

  return sort(root);
}

export function PreviewPanel({ config }: { config: ProjectConfig }) {
  const tree = useMemo(() => {
    try {
      const vfs = generate(config);
      return buildTree([...vfs.entries()].map(([p]) => p));
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [config]);

  const fileCount = useMemo(() => {
    try {
      return generate(config).size();
    } catch {
      return 0;
    }
  }, [config]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-secondary/30">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-brand" />
          <span className="text-[11px] uppercase tracking-wider font-medium">Preview</span>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </span>
      </div>
      <div className="flex-1 overflow-auto px-2 py-2 text-[12px] font-mono">
        {tree.map((n) => (
          <TreeRow key={n.path} node={n} depth={0} />
        ))}
        {tree.length === 0 && (
          <div className="text-muted-foreground p-4">No files — everything set to none.</div>
        )}
      </div>
    </div>
  );
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(
    node.kind === "dir" ? node.startOpen : true,
  );

  if (node.kind === "file") {
    return (
      <div
        className="flex items-center gap-1.5 px-1 py-0.5 text-foreground/80 hover:bg-secondary truncate"
        style={{ paddingLeft: 6 + depth * 12 }}
        title={node.path}
      >
        <FileCode2 className="w-3 h-3 shrink-0 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 w-full px-1 py-0.5 hover:bg-secondary text-left"
        style={{ paddingLeft: 4 + depth * 12 }}
      >
        <ChevronRight
          className={"w-3 h-3 shrink-0 transition-transform " + (open ? "rotate-90" : "")}
        />
        {open ? (
          <FolderOpen className="w-3 h-3 shrink-0 text-brand" />
        ) : (
          <FolderClosed className="w-3 h-3 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-foreground">{node.name}</span>
      </button>
      {open &&
        node.children.map((c) => <TreeRow key={c.path} node={c} depth={depth + 1} />)}
    </div>
  );
}
