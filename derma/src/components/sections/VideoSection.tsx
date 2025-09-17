import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { getSectionText, getAssetUrl } from '../../lib/config-helpers';

interface VideoSectionProps {
    controller: any;
}

export function VideoSection({ controller }: VideoSectionProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const { config } = controller;

    const videoUrl = getAssetUrl(config, 'assets.videoUrl');
    const videoPoster = getAssetUrl(config, 'assets.videoPoster');

    if (!videoUrl) return null;

    const handlePlayPause = () => {
        const video = document.getElementById('demo-video') as HTMLVideoElement;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section className="py-20 bg-gray-900 text-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {getSectionText(config, 'videoSectionTitle') || 'See It In Action'}
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        {getSectionText(config, 'videoSectionSubtitle') ||
                         'Watch how the Kidsneed® Laser Pen safely and effectively removes unwanted skin imperfections'}
                    </p>
                </div>

                {/* Video Container */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                        <video
                            id="demo-video"
                            className="w-full h-auto"
                            poster={videoPoster}
                            controls={false}
                            playsInline
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                        >
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Custom Play Button Overlay */}
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <button
                                    onClick={handlePlayPause}
                                    className="group bg-white/90 hover:bg-white rounded-full p-6 transition-all duration-300 transform hover:scale-110"
                                >
                                    <Play className="h-12 w-12 text-gray-900 ml-1" />
                                </button>
                            </div>
                        )}

                        {/* Video Controls Overlay */}
                        {isPlaying && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center justify-between bg-black/50 rounded-lg px-4 py-2">
                                    <button
                                        onClick={handlePlayPause}
                                        className="text-white hover:text-gray-300 transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-6 w-6" />
                                        ) : (
                                            <Play className="h-6 w-6" />
                                        )}
                                    </button>
                                    <div className="text-white text-sm">
                                        Click to {isPlaying ? 'pause' : 'play'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Benefits */}
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Precise Targeting</h3>
                            <p className="text-gray-300">
                                Advanced CO₂ laser technology precisely targets imperfections without damaging surrounding skin
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Fast Results</h3>
                            <p className="text-gray-300">
                                See visible improvements in just days with our professional-grade laser technology
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🏠</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Home Convenience</h3>
                            <p className="text-gray-300">
                                Skip expensive clinic visits and achieve professional results from the comfort of your home
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}