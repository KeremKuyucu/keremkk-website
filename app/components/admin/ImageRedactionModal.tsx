"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    FaShieldAlt,
    FaUndo,
    FaTrash,
    FaTimes,
    FaPaperPlane,
    FaInfoCircle,
} from "react-icons/fa";

interface RedactionBox {
    /** Normalized coordinates (0..1) relative to image dimensions */
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageRedactionModalProps {
    file: File;
    onCancel: () => void;
    onConfirm: (redactedFile: File, redactedRegionsCount: number) => void;
}

export default function ImageRedactionModal({
    file,
    onCancel,
    onConfirm,
}: ImageRedactionModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [boxes, setBoxes] = useState<RedactionBox[]>([]);
    const [draftBox, setDraftBox] = useState<RedactionBox | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Load file into HTMLImageElement
    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            imageRef.current = img;
            setIsLoaded(true);
            setLoadError(null);
        };

        img.onerror = () => {
            setLoadError("Görsel yüklenemedi. Lütfen geçerli bir PNG/JPG/WEBP dosyası seçin.");
        };

        img.src = objectUrl;

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    // Render image + redaction boxes on display canvas
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const maxDisplayWidth = 960;
        const scale = img.naturalWidth > maxDisplayWidth ? maxDisplayWidth / img.naturalWidth : 1;
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Draw confirmed solid black redaction boxes
        ctx.fillStyle = "#000000";
        for (const box of boxes) {
            ctx.fillRect(
                box.x * width,
                box.y * height,
                box.width * width,
                box.height * height
            );
        }

        // Draw active drag preview
        if (draftBox) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
            ctx.fillRect(
                draftBox.x * width,
                draftBox.y * height,
                draftBox.width * width,
                draftBox.height * height
            );
            ctx.strokeStyle = "#8b5cf6";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.strokeRect(
                draftBox.x * width,
                draftBox.y * height,
                draftBox.width * width,
                draftBox.height * height
            );
            ctx.setLineDash([]);
        }
    }, [boxes, draftBox]);

    useEffect(() => {
        if (isLoaded) {
            redrawCanvas();
        }
    }, [isLoaded, redrawCanvas]);

    const getNormalizedCoords = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
        return { x, y };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        const coords = getNormalizedCoords(e.clientX, e.clientY);
        setDragStart(coords);
        setDraftBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!dragStart) return;
        e.preventDefault();
        const current = getNormalizedCoords(e.clientX, e.clientY);
        setDraftBox({
            x: Math.min(dragStart.x, current.x),
            y: Math.min(dragStart.y, current.y),
            width: Math.abs(current.x - dragStart.x),
            height: Math.abs(current.y - dragStart.y),
        });
    };

    const finishDrag = () => {
        if (draftBox && draftBox.width > 0.008 && draftBox.height > 0.008) {
            setBoxes((prev) => [...prev, draftBox]);
        }
        setDragStart(null);
        setDraftBox(null);
    };

    const handleExportAndConfirm = async () => {
        const img = imageRef.current;
        if (!img) return;

        setIsExporting(true);
        try {
            // Export at full original resolution so OCR stays sharp,
            // while permanently burning black boxes and stripping EXIF metadata.
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = img.naturalWidth;
            exportCanvas.height = img.naturalHeight;

            const ctx = exportCanvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvas context oluşturulamadı.");
            }

            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = "#000000";
            for (const box of boxes) {
                ctx.fillRect(
                    Math.round(box.x * img.naturalWidth),
                    Math.round(box.y * img.naturalHeight),
                    Math.round(box.width * img.naturalWidth),
                    Math.round(box.height * img.naturalHeight)
                );
            }

            const outputType =
                file.type === "image/jpeg" ? "image/jpeg" : "image/png";
            const outputExt = outputType === "image/jpeg" ? "jpg" : "png";

            const blob = await new Promise<Blob>((resolve, reject) => {
                exportCanvas.toBlob(
                    (b) => {
                        if (b) resolve(b);
                        else reject(new Error("Görsel dışa aktarılamadı."));
                    },
                    outputType,
                    outputType === "image/jpeg" ? 0.92 : undefined
                );
            });

            // Dosya adını da anonimleştir
            const sanitizedFile = new File(
                [blob],
                `redacted-statement.${outputExt}`,
                { type: outputType }
            );

            onConfirm(sanitizedFile, boxes.length);
        } catch (err) {
            setLoadError(
                err instanceof Error ? err.message : "Görsel işlenirken hata oluştu."
            );
            setIsExporting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => !isExporting && onCancel()}
        >
            <div
                className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl border border-white/20 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                            <FaShieldAlt />
                        </div>
                        <div>
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                                Görsel Kişisel Bilgi Sansürleme
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                AI&apos;ya göndermeden önce Ad-Soyad, IBAN, Kart No ve adres alanlarını sürükleyerek karartın
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isExporting}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Toolbar & Tip */}
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/40 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <FaInfoCircle className="text-violet-500 shrink-0" />
                        <span>
                            Karartılan bölgeler kalıcı olarak siyaha boyanır ve EXIF/konum bilgileri otomatik silinir.
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                            {boxes.length} alan karartıldı
                        </span>
                        <button
                            type="button"
                            onClick={() => setBoxes((prev) => prev.slice(0, -1))}
                            disabled={boxes.length === 0 || isExporting}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition flex items-center gap-1.5"
                        >
                            <FaUndo />
                            Geri Al
                        </button>
                        <button
                            type="button"
                            onClick={() => setBoxes([])}
                            disabled={boxes.length === 0 || isExporting}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition flex items-center gap-1.5"
                        >
                            <FaTrash />
                            Temizle
                        </button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 overflow-auto p-4 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center min-h-[280px]">
                    {loadError ? (
                        <p className="text-sm text-red-500 font-medium">{loadError}</p>
                    ) : !isLoaded ? (
                        <p className="text-sm text-gray-400">Görsel hazırlanıyor...</p>
                    ) : (
                        <canvas
                            ref={canvasRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={finishDrag}
                            onPointerCancel={finishDrag}
                            className="max-w-full max-h-[60vh] h-auto w-auto rounded-xl shadow-lg border border-gray-300 dark:border-zinc-700 cursor-crosshair touch-none select-none"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isExporting}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-zinc-800 transition"
                    >
                        İptal
                    </button>

                    <button
                        type="button"
                        onClick={handleExportAndConfirm}
                        disabled={!isLoaded || !!loadError || isExporting}
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        <FaPaperPlane />
                        {isExporting
                            ? "Hazırlanıyor..."
                            : boxes.length > 0
                              ? `Sansürleyip AI'ya Gönder (${boxes.length} alan)`
                              : "EXIF Temizleyip AI'ya Gönder"}
                    </button>
                </div>
            </div>
        </div>
    );
}
