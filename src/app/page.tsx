"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
 
const Navbar = () => {
const [openNavbar, setOpenNavbar] = useState(false)
const toggleNavbar = () => {
    setOpenNavbar(openNavbar => !openNavbar)
}
const closeNavbar = () => {
    setOpenNavbar(false)
}
return (
    <>
        <div onClick={() => { closeNavbar() }} aria-hidden="true" className={
            `fixed bg-gray-800/40 inset-0 z-30 ${openNavbar ? "flex lg:hidden" : "hidden"}`
        } />
        <header className="absolute inset-x-0 top-0 flex items-center h-20 z-40 pt-4 px-4">
            <nav className="relative mx-auto lg:max-w-7xl w-full border border-gray-100 dark:border-gray-900 bg-white/70 dark:bg-gray-950 rounded-xl h-full px-4 flex gap-x-5 justify-between items-center">
                <div className="flex items-center min-w-max">
                    <Link href="#" className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        <span className="relative after:absolute after:inset-0 after:rotate-3 after:border after:border-blue-700 dark:after:border-blue-600 text-blue-700 dark:text-blue-600">Health</span>Sync
                    </Link>
                </div>
                <div className={`
                    fixed inset-y-0 w-10/12 max-w-md lg:max-w-none bg-white dark:bg-gray-950 lg:!bg-transparent border-b border-gray-200 dark:border-gray-800 py-8 lg:py-0 px-5 sm:px-10 md:px-12 lg:px-0 lg:border-none lg:w-full lg:top-0 lg:relative lg:flex lg:justify-between duration-300 ease-linear gap-x-6
                    ${openNavbar ? "left-0" : "-left-full lg:left-0"}
                `}>
                    <ul className="flex flex-col lg:flex-row gap-6 lg:items-center text-gray-700 dark:text-gray-300 lg:flex-1 lg:justify-center">
                        <li>
                            <Link href="#" className="duration-300 ease-linear hover:text-green-600 flex items-center gap-1.5 justify-between">
                                Solutions
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="duration-300 ease-linear hover:text-green-600 flex items-center gap-1.5 justify-between">
                                Products
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="duration-300 ease-linear hover:text-green-600 ">Support</Link>
                        </li>
                        <li>
                            <Link href="#" className="duration-300 ease-linear hover:text-green-600 ">Company</Link>
                        </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4  lg:min-w-max mt-10 lg:mt-0">
                        <Link href="" className="px-6 h-10 text-sm flex items-center w-full lg:w-max justify-center gap-x-3 border border-gray-200 dark:border-gray-800 rounded-lg text-green-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
                            Book Demo
                        </Link>
                    </div>
                </div>
                <div className="flex items-center lg:hidden">
                    <button onClick={() => { toggleNavbar() }} aria-label="Toggle navbar" className="outline-none border-l border-l-blue-100 dark:border-l-gray-800 pl-3 relative py-3 children:flex">
                        <span aria-hidden="true" className={`
                                    h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
                                    ${openNavbar ? "rotate-45 translate-y-[0.33rem]" : ""}
                                `} />
                        <span aria-hidden="true" className={`
                                    mt-2 h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
                                    ${openNavbar ? "-rotate-45 -translate-y-[0.33rem]" : ""}
                                `} />
                    </button>
                </div>
            </nav>
        </header>
    </>
)
}
 
const metrics = [
{
    id: 1,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width={20} className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>,
    stat: "4.5 Stars",
    title: "430 Reviews"
},
{
    id: 2,
    icon: <svg className="w-5 h-5" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.125 3.02173C9.78748 3.02173 3.02081 9.78931 3.02081 18.1279C3.02081 26.4666 9.78748 33.2341 18.125 33.2341C26.4625 33.2341 33.2291 26.4666 33.2291 18.1279C33.2291 9.78931 26.4625 3.02173 18.125 3.02173ZM29.3927 13.7773L25.1937 15.5146C24.8154 14.4966 24.2213 13.5726 23.4522 12.8059C22.683 12.0393 21.7571 11.4482 20.738 11.0733L22.475 6.87381C25.6469 8.08231 28.1693 10.605 29.3927 13.7773ZM18.125 22.6598C15.6177 22.6598 13.5937 20.6356 13.5937 18.1279C13.5937 15.6203 15.6177 13.5961 18.125 13.5961C20.6323 13.5961 22.6562 15.6203 22.6562 18.1279C22.6562 20.6356 20.6323 22.6598 18.125 22.6598ZM13.7901 6.8587L15.5573 11.0582C14.5261 11.4341 13.5893 12.0301 12.8119 12.805C12.0346 13.5798 11.4355 14.5148 11.0562 15.5448L6.85727 13.7924C7.46293 12.2156 8.39302 10.7836 9.58731 9.58911C10.7816 8.39466 12.2134 7.46444 13.7901 6.8587ZM6.85727 22.4634L11.0562 20.7262C11.4328 21.7535 12.0295 22.686 12.8044 23.4585C13.5793 24.2309 14.5137 24.8244 15.5422 25.1976L13.775 29.3972C12.2017 28.7887 10.7733 27.8573 9.58184 26.6631C8.39038 25.4688 7.46225 24.0382 6.85727 22.4634ZM22.475 29.3972L20.738 25.1976C21.7619 24.8182 22.6908 24.2203 23.4603 23.4456C24.2298 22.6708 24.8213 21.7376 25.1937 20.7111L29.3927 22.4785C28.785 24.05 27.8558 25.4772 26.6645 26.6686C25.4733 27.8601 24.0463 28.7894 22.475 29.3972Z" fill="white" /></svg>,
    stat: "H 24/24",
    title: "Support"
},
{
    id: 3,
    icon: <svg className="w-5 h-5" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.125 3.02173C9.78748 3.02173 3.02081 9.78931 3.02081 18.1279C3.02081 26.4666 9.78748 33.2341 18.125 33.2341C26.4625 33.2341 33.2291 26.4666 33.2291 18.1279C33.2291 9.78931 26.4625 3.02173 18.125 3.02173ZM29.3927 13.7773L25.1937 15.5146C24.8154 14.4966 24.2213 13.5726 23.4522 12.8059C22.683 12.0393 21.7571 11.4482 20.738 11.0733L22.475 6.87381C25.6469 8.08231 28.1693 10.605 29.3927 13.7773ZM18.125 22.6598C15.6177 22.6598 13.5937 20.6356 13.5937 18.1279C13.5937 15.6203 15.6177 13.5961 18.125 13.5961C20.6323 13.5961 22.6562 15.6203 22.6562 18.1279C22.6562 20.6356 20.6323 22.6598 18.125 22.6598ZM13.7901 6.8587L15.5573 11.0582C14.5261 11.4341 13.5893 12.0301 12.8119 12.805C12.0346 13.5798 11.4355 14.5148 11.0562 15.5448L6.85727 13.7924C7.46293 12.2156 8.39302 10.7836 9.58731 9.58911C10.7816 8.39466 12.2134 7.46444 13.7901 6.8587ZM6.85727 22.4634L11.0562 20.7262C11.4328 21.7535 12.0295 22.686 12.8044 23.4585C13.5793 24.2309 14.5137 24.8244 15.5422 25.1976L13.775 29.3972C12.2017 28.7887 10.7733 27.8573 9.58184 26.6631C8.39038 25.4688 7.46225 24.0382 6.85727 22.4634ZM22.475 29.3972L20.738 25.1976C21.7619 24.8182 22.6908 24.2203 23.4603 23.4456C24.2298 22.6708 24.8213 21.7376 25.1937 20.7111L29.3927 22.4785C28.785 24.05 27.8558 25.4772 26.6645 26.6686C25.4733 27.8601 24.0463 28.7894 22.475 29.3972Z" fill="white" /></svg>,
    stat: "+ 5k",
    title: "Clients"
},
]
 
export default function HeroSection() {
return (
    <>
        <Navbar />
        <main>
            <section className="relative bg-blue-50 dark:bg-gray-900/30 pt-32 lg:pt-24 pb-32 lg:pb-4">
                <div className="mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 lg:-translate-x-0 lg:-translate-y-0 lg:left-0 lg:top-16 w-40 h-40 skew-x-6 opacity-50 dark:opacity-80 rounded-full bg-gradient-to-bl from-green-600 to-sky-400 blur-3xl flex" />
                    <div className="flex text-center lg:text-left flex-col lg:items-center lg:flex-row gap-8 lg:gap-10 xl:gap-12 relative max-w-4xl lg:max-w-none">
                        <div className="space-y-8 xl:space-y-10 lg:py-12 flex-1 lg:w-1/2">
                            <h1 className="text-blue-950 dark:text-white text-3xl/tight sm:text-4xl/tight md:text-5xl/tight xl:text-6xl/tight font-bold">
                                The only all in one <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-700 to-sky-600">Tool</span> you need for your Clinic
                            </h1>
                            <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto lg:max-w-none">
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laudantium omnis, molestias expedita soluta facilis sapiente incidunt.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 z-30 sm:w-max sm:flex-nowrap mx-auto lg:mx-0">
                                <Link href="#" className="px-5 h-12 flex items-center sm:w-max w-full justify-center bg-gradient-to-br from-blue-700 to-sky-600 text-white rounded-lg ease-linear transition">
                                    Get Started
                                </Link>
                                <Link href="#" className="px-5 h-12 flex items-center sm:w-max w-full justify-center gap-x-3 border border-gray-200 dark:border-gray-900/60 rounded-lg text-green-800 dark:text-gray-100 bg-green-50 dark:bg-gray-900">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    Watch Demo
                                </Link>
                            </div>
                            <div className="max-w-lg lg:max-w-none mx-auto grid sm:grid-cols-3 divide-y divide-gray-100 dark:divide-gray-900 sm:divide-y-0 sm:gap-2 p-4 py-0 sm:py-4 text-left rounded-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 shadow-sm shadow-gray-200/50 dark:shadow-transparent">
                                {
                                    metrics.map(metric => (
                                        <div key={metric.id} className="flex items-center gap-x-4 py-4 sm:py-0">
                                            <span className="w-10 h-10 text-white bg-gradient-to-br from-blue-700 to-sky-400 rounded-md flex items-center justify-center">
                                                {metric.icon}
                                            </span>
                                            <div className="flex-1 flex flex-col text-sm">
                                                <h4 className=" text-gray-700 dark:text-gray-300 font-semibold">{metric.stat}</h4>
                                                <span className="text-xs text-gray-400">{metric.title}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div aria-hidden="true" className="flex-1 lg:w-1/2 relative hidden lg:flex justify-end pr-8">
                            <div className="rounded-lg absolute right-0 bottom-0 w-11/12 h-2/5 bg-gradient-to-tr from-blue-50 to-sky-100 dark:bg-gradient-to-tr dark:from-gray-950 dark:to-gray-700" />
                            <Image src="/doc-smiling.png" width={3200} height={1900} className="w-11/12 h-auto relative" alt="portrait-of-smiling-medical-worker-girl-doctor" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </>
)
}