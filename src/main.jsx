import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="staff-app-theme">
                <AuthProvider>
                    <App />
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: 'var(--card)',
                                color: 'var(--card-foreground)',
                                border: '2px solid var(--border)',
                            },
                            success: {
                                style: {
                                    background: '#22c55e',
                                    color: '#fff',
                                },
                            },
                            error: {
                                style: {
                                    background: '#ef4444',
                                    color: '#fff',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
