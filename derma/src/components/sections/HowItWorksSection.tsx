import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface HowItWorksSectionProps {
    controller: any;
}

export function HowItWorksSection({ controller }: HowItWorksSectionProps) {
    const { config } = controller;

    const timelineSteps = [
        {
            day: "Day 1-3",
            title: "Visible skin soothing",
            description: "Visible skin soothing with reduced irritation and inflammation",
            icon: "🌱",
            color: "bg-green-500"
        },
        {
            day: "Day 13",
            title: "Clear destruction",
            description: "Clear destruction of abnormal tissue, completely painless",
            icon: "🎯",
            color: "bg-blue-500"
        },
        {
            day: "Day 16",
            title: "Complete elimination",
            description: "Complete elimination of treated areas with consistent application",
            icon: "✨",
            color: "bg-purple-500"
        }
    ];

    return (
        <section id="how-it-works-section" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        The device utilizes advanced ionic electrical technology to instantly eliminate skin tags and unwanted tissue while reducing discoloration and imperfections. Simply apply for a few seconds every other day on the targeted area.
                    </p>
                </div>

                {/* Timeline Steps */}
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {timelineSteps.map((step, index) => (
                            <div key={index} className="relative">
                                {/* Connection Line */}
                                {index < timelineSteps.length - 1 && (
                                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gray-300 hidden md:block z-0" />
                                )}

                                {/* Step Card */}
                                <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow z-10">
                                    {/* Step Icon */}
                                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6`}>
                                        {step.icon}
                                    </div>

                                    {/* Day Badge */}
                                    <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-4">
                                        {step.day}
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technology Highlight */}
                <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">
                                Advanced Ionic Electrical Technology
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-gray-700">Instant elimination of unwanted tissue</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-gray-700">Reduces discoloration and imperfections</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-gray-700">Safe for home use, professional results</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-gray-700">Apply for seconds every other day</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
                                <div className="text-6xl mb-4">⚡</div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                                    FDA Approved Device
                                </h4>
                                <p className="text-gray-600 mb-6">
                                    Clinically tested and approved for safe, effective home treatment of skin imperfections.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                        FDA Approved
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Clinically Tested
                                    </span>
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Dermatologist Recommended
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}