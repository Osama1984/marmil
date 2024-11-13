'use client';
import { resize } from '@/lib/features/UISlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React, { useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';

export default function SiteContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();

    // Set up useResizeDetector to listen for resizing
    const { width, height, ref } = useResizeDetector({
        handleHeight: false,    // Not tracking height in this case
        refreshMode: 'debounce', // Optional: Debounce resize events for performance
        refreshRate: 500,       // Optional: 500ms debounce delay
    });

    // Use useEffect to update the state after the render
    useEffect(() => {
        if (width && height) {
            // Dispatch the resize action only after width and height are available
            dispatch(resize({ width, height }));
        }
    }, [dispatch, width, height]);

    return (
        <div ref={ref} className='w-full h-full bg-transparent merriweather-regular flex flex-col min-h-screen'>{children}</div>  // Attach ref to the element being resized
    );
}