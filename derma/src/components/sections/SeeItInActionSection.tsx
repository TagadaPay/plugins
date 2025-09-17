import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface SeeItInActionSectionProps {
    controller: any;
}

export function SeeItInActionSection({ controller }: SeeItInActionSectionProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { config } = controller;

    const toggleVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
    };

    return (
        <section id="see-it-in-action-section" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        See It In Action
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Watch how the Kidsneed® Laser Pen safely and effectively removes unwanted skin imperfections
                    </p>
                </div>

                {/* Video Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                        {/* Video Element */}
                        <video
                            ref={videoRef}
                            className="w-full h-auto"
                            style={{ maxHeight: '500px', objectFit: 'cover' }}
                            poster="/images/hero-image.png"
                            onEnded={handleVideoEnd}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                        >
                            <source src="/videos/demo-video.mp4" type="video/mp4" />
                            <source src="/videos/demo-video.webm" type="video/webm" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Play/Pause Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={toggleVideo}
                                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-6 transition-all duration-300 group"
                            >
                                {isPlaying ? (
                                    <Pause className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                                ) : (
                                    <Play className="h-10 w-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Benefits */}
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Precise Targeting</h3>
                        <p className="text-gray-600">
                            Advanced CO₂ laser technology precisely targets imperfections
                        </p>
                    </div>

                    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Results</h3>
                        <p className="text-gray-600">
                            See visible improvements in just 7-14 days
                        </p>
                    </div>

                    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Home Convenience</h3>
                        <p className="text-gray-600">
                            Professional results from the comfort of your home
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}