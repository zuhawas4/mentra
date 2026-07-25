"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { boardColors, strokeWidths, type BoardStroke } from "@mentra/shared";
import {
  Download,
  Eraser,
  MousePointer2,
  Pencil,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Tool = "select" | "pen" | "eraser";

export function WhiteboardCanvas({
  strokes,
  onChange,
  authorId,
  readOnly,
}: {
  strokes: BoardStroke[];
  onChange: (strokes: BoardStroke[]) => void;
  authorId: string;
  readOnly?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const currentPoints = useRef<number[]>([]);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(boardColors[0].value);
  const [width, setWidth] = useState<number>(strokeWidths[1]);
  const [past, setPast] = useState<BoardStroke[][]>([]);
  const [future, setFuture] = useState<BoardStroke[][]>([]);

  const redraw = useCallback(
    (items: BoardStroke[], preview?: number[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // subtle grid
      ctx.strokeStyle = "#F0F0F6";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const drawStroke = (stroke: {
        points: number[];
        color: string;
        width: number;
        tool: "pen" | "eraser";
      }) => {
        if (stroke.points.length < 4) return;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = stroke.width;
        if (stroke.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = stroke.color;
        }
        ctx.beginPath();
        ctx.moveTo(stroke.points[0], stroke.points[1]);
        for (let i = 2; i < stroke.points.length; i += 2) {
          ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      };

      for (const stroke of items) drawStroke(stroke);
      if (preview) {
        drawStroke({
          points: preview,
          color,
          width: tool === "eraser" ? Math.max(width * 2, 12) : width,
          tool: tool === "eraser" ? "eraser" : "pen",
        });
      }
    },
    [color, tool, width],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw(strokes);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw, strokes]);

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function commit(next: BoardStroke[]) {
    setPast((p) => [...p, strokes]);
    setFuture([]);
    onChange(next);
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (readOnly || tool === "select") return;
    drawing.current = true;
    const { x, y } = pointerPos(e);
    currentPoints.current = [x, y];
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const { x, y } = pointerPos(e);
    currentPoints.current.push(x, y);
    redraw(strokes, currentPoints.current);
  }

  function onPointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentPoints.current.length < 4) {
      currentPoints.current = [];
      return;
    }
    const stroke: BoardStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      points: [...currentPoints.current],
      color,
      width: tool === "eraser" ? Math.max(width * 2, 12) : width,
      tool: tool === "eraser" ? "eraser" : "pen",
      authorId,
      createdAt: new Date().toISOString(),
    };
    currentPoints.current = [];
    commit([...strokes, stroke]);
  }

  function undo() {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [strokes, ...f]);
    onChange(prev);
  }

  function redo() {
    if (!future.length) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setPast((p) => [...p, strokes]);
    onChange(next);
  }

  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `mentra-board-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[var(--mentra-border)] bg-white shadow-[var(--mentra-shadow)]">
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--mentra-border)] bg-[#FAFAFC] px-3 py-2.5">
          <ToolButton
            active={tool === "select"}
            onClick={() => setTool("select")}
            label="Select / pan"
          >
            <MousePointer2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            active={tool === "pen"}
            onClick={() => setTool("pen")}
            label="Pen"
          >
            <Pencil className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            active={tool === "eraser"}
            onClick={() => setTool("eraser")}
            label="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </ToolButton>

          <div className="mx-1 h-6 w-px bg-[var(--mentra-border)]" />

          <div className="flex items-center gap-1.5" role="group" aria-label="Colors">
            {boardColors.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.label}
                onClick={() => {
                  setColor(c.value);
                  setTool("pen");
                }}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition",
                  color === c.value && tool === "pen"
                    ? "border-[var(--mentra-ink)] scale-110"
                    : "border-transparent",
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <div className="mx-1 h-6 w-px bg-[var(--mentra-border)]" />

          <div className="flex items-center gap-1.5" role="group" aria-label="Stroke width">
            {strokeWidths.map((w) => (
              <button
                key={w}
                type="button"
                aria-label={`Stroke ${w}`}
                onClick={() => setWidth(w)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  width === w
                    ? "bg-[var(--mentra-primary-soft)]"
                    : "hover:bg-white",
                )}
              >
                <span
                  className="rounded-full bg-[var(--mentra-ink)]"
                  style={{ width: w + 2, height: w + 2 }}
                />
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={exportPng}
              aria-label="Download board PNG"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={undo}
              disabled={!past.length}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={redo}
              disabled={!future.length}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Clear board">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear the board?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all strokes from the current session board.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => commit([])}
                    className="bg-[var(--mentra-danger)] hover:bg-[#a83232]"
                  >
                    Clear board
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : null}

      <div ref={containerRef} className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 touch-none",
            readOnly || tool === "select" ? "cursor-default" : "cursor-crosshair",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition",
        active
          ? "bg-[var(--mentra-primary)] text-white"
          : "text-[var(--mentra-muted)] hover:bg-white hover:text-[var(--mentra-ink)]",
      )}
    >
      {children}
    </button>
  );
}
