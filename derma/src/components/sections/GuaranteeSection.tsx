import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface GuaranteeSectionProps {
    controller: any;
}

export function GuaranteeSection({ controller }: GuaranteeSectionProps) {
    const { config } = controller;

    return (
        <section className="py-20 bg-primary text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>

            <div className="container mx-auto px-4 relative">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Guarantee Icon */}
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-4xl">🛡️</span>
                    </div>

                    {/* Main Title */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {getSectionText(config, 'guaranteeTitle')}
                    </h2>

                    {/* Description */}
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        {getSectionText(config, 'guaranteeDescription')}
                    </p>

                    {/* Guarantee Features */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Full Refund</h3>
                            <p className="opacity-80">Complete money-back guarantee if not satisfied</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">180 Days</h3>
                            <p className="opacity-80">6 full months to try our product risk-free</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Questions</h3>
                            <p className="opacity-80">Simple return process with no hassle</p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-white/10 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold mb-6">How Our Guarantee Works</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-left">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                                <div>
                                    <h4 className="font-semibold mb-1">Try Our Product</h4>
                                    <p className="text-sm opacity-80">Use the device for up to 180 days</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                                <div>
                                    <h4 className="font-semibold mb-1">Contact Support</h4>
                                    <p className="text-sm opacity-80">If unsatisfied, reach out to our team</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                                <div>
                                    <h4 className="font-semibold mb-1">Get Full Refund</h4>
                                    <p className="text-sm opacity-80">Return the product and receive 100% refund</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                        className="btn-secondary bg-white text-primary hover:bg-gray-100 mt-8"
                        onClick={() => {
                            document.getElementById('product-section')?.scrollIntoView({ 
                                behavior: 'smooth' 
                            });
                        }}
                    >
                        Try Risk-Free Now
                    </button>
                </div>
            </div>
        </section>
    );
}