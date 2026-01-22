import { Fragment, useRef, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, RotateCcw, Pen } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function SignatureModal({ isOpen, closeModal, currentSignature }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            
            // Set canvas internal size
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Set white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Set drawing styles
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [isOpen]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const coords = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const coords = getCoordinates(e);
        
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Touch events for mobile/tablet support
    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const saveSignature = () => {
        if (!hasDrawn) {
            alert('Please draw your signature first');
            return;
        }

        setSaving(true);
        const canvas = canvasRef.current;
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('signature', blob, 'signature.png');

            router.post(route('admin.signature.upload'), formData, {
                onSuccess: () => {
                    setSaving(false);
                    closeModal();
                },
                onError: (errors) => {
                    setSaving(false);
                    alert(errors.signature || 'Failed to save signature');
                }
            });
        }, 'image/png');
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                            <Dialog.Title as="div" className="flex items-center justify-between border-b p-4 bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <Pen className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-medium">Create Your Signature</h3>
                                </div>
                                <button 
                                    onClick={closeModal} 
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={saving}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Title>

                            <div className="p-6">
                                {currentSignature && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-800">
                                            You already have a signature. Drawing a new one will replace it.
                                        </p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Draw your signature in the box below using your mouse or touchpad:
                                    </p>
                                </div>

                                {/* Canvas */}
                                <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4 bg-white">
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        className="cursor-crosshair w-full"
                                        style={{ 
                                            touchAction: 'none',
                                            height: '200px',
                                            display: 'block'
                                        }}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={clearSignature}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        disabled={saving}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Clear
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveSignature}
                                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            disabled={saving || !hasDrawn}
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? 'Saving...' : 'Save Signature'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}