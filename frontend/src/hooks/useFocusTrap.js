import { useEffect } from 'react';

export function useFocusTrap(ref, isActive, onClose) {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = ref.current?.querySelectorAll(
                    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Auto-focus first input or button when opened
        const timer = setTimeout(() => {
            if (ref.current) {
                const input = ref.current.querySelector('input');
                if (input) {
                    input.focus();
                } else {
                    const firstInteractive = ref.current.querySelector('button, [tabindex="0"]');
                    if (firstInteractive) firstInteractive.focus();
                }
            }
        }, 100);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [isActive, ref, onClose]);
}
