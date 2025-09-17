import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { getSectionText } from '../lib/config-helpers';

interface NavigationProps {
    controller: any;
}

export function Navigation({ controller }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { config, selectedPack, onBuyNow, initLoading } = controller;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        setIsOpen(false);
    };

    const menuItems = [
        { label: 'Features', id: 'why-choose-section' },
        { label: 'Results', id: 'visible-results-section' },
        { label: 'Treatment', id: 'painless-removal-section' },
        { label: 'How It Works', id: 'how-it-works-section' },
        { label: 'Video', id: 'see-it-in-action-section' },
        { label: 'Shop', id: 'product-section' }
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
            }`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <button
                                onClick={() => scrollToSection('hero-section')}
                                className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
                            >
                                {config?.branding?.logoText || 'Kidsneed®'}
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center space-x-4">
                            <button
                                onClick={() => scrollToSection('product-section')}
                                className="btn-primary px-6 py-2 text-sm"
                            >
                                {getSectionText(config, 'primaryButton') || 'SHOP NOW'}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Menu className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-16 left-0 right-0 bg-white shadow-xl">
                        <div className="px-6 py-6 space-y-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="block w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary font-medium transition-colors rounded-lg"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => scrollToSection('product-section')}
                                    className="btn-primary w-full py-3"
                                >
                                    {getSectionText(config, 'primaryButton') || 'SHOP NOW'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed navigation */}
            <div className="h-16" />
        </>
    );
}