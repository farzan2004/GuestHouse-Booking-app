import React from 'react'

const TandC = () => {
    return (
        <div className="min-h-screen px-4 py-6 bg-custom-color bg-[radial-gradient(circle_at_60%_40%,#fce8d5_0%,#fef2e3_50%,#fff8ef_100%)]">
            <div className="max-w-5xl mx-auto flex flex-col items-center space-y-3 mt-12">
                <div className="flex justify-center bg-slate-300 p-6 shadow-lg rounded-lg w-full mb-1">
                    <h1 className="md:text-3xl text-2xl font-semibold" style={{ fontFamily: "monospace" }}>Terms And Conditions</h1>
                </div>
                <div className="bg-slate-300 p-6 shadow-lg rounded-lg w-full flex flex-col space-y-5 items-center">
                    <ul className="list-none md:space-y-8 space-y-5 text-gray-900 md:text-lg text-base w-full px-2 playfair">
                        <li>✓&nbsp;&nbsp; Persons staying in the Guest House are not entitled to bring unauthorized guests to stay with them.</li>
                        <li>✓&nbsp;&nbsp; Alcoholic drinks in the Guest House are strictly prohibited.</li>
                        <li>✓&nbsp;&nbsp; Cooking or washing is not allowed in the rooms.</li>
                        <li>✓&nbsp;&nbsp; Food, meals, and breakfast are served only in the dining hall.</li>
                        <li>✓&nbsp;&nbsp; Guests are requested to switch off lights, fans, and AC and lock their room before going out.</li>
                        <li>✓&nbsp;&nbsp; Any damage or loss to the Guest House will incur a fine, payable by the guest or the requisitioner.</li>
                        <li>✓&nbsp;&nbsp; Guests are requested to maintain decorum and refrain from any activity that may disturb or inconvenience other &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;occupants.</li>

                    </ul>
                </div>
            </div>
        </div>
    )
}

export default TandC
