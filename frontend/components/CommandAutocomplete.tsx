import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Command, Search } from 'lucide-react';

interface CommandAutocompleteProps {
    inputValue: string;
    suggestions: string[];
    onSelectSuggestion: (suggestion: string) => void;
    visible: boolean;
}

export function CommandAutocomplete({
    inputValue,
    suggestions,
    onSelectSuggestion,
    visible
}: CommandAutocompleteProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset selection when input changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [inputValue]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!visible || suggestions.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % suggestions.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (suggestions[selectedIndex]) {
                        onSelectSuggestion(suggestions[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onSelectSuggestion('');
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [visible, suggestions, selectedIndex, onSelectSuggestion]);

    // Scroll selected item into view
    useEffect(() => {
        if (containerRef.current && selectedIndex >= 0) {
            const selectedElement = containerRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!visible || suggestions.length === 0) {
        return null;
    }

    const commandName = inputValue.slice(1); // Remove the leading slash

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64">
            <div className="p-2 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    <span>Commands matching "{commandName}"</span>
                    <Badge variant="secondary" className="ml-auto">
                        {suggestions.length} found
                    </Badge>
                </div>
            </div>

            <ScrollArea className="max-h-48">
                <div ref={containerRef} className="p-1">
                    {suggestions.map((suggestion, index) => (
                        <Button
                            key={suggestion}
                            variant={index === selectedIndex ? "secondary" : "ghost"}
                            className={`w-full justify-start h-auto p-2 ${index === selectedIndex ? "bg-secondary" : "hover:bg-muted"
                                }`}
                            onClick={() => onSelectSuggestion(suggestion)}
                        >
                            <Command className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="font-mono">/{suggestion}</span>
                        </Button>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-2 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                    <span>Use ↑↓ to navigate, Enter to select, Esc to cancel</span>
                    <span className="text-xs">
                        {selectedIndex + 1} of {suggestions.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
