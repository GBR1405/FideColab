import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const AdminDashboard = () => {
    const [active, setActive] = useState(0);
    const [metrics, setMetrics] = useState({
        partidasJugadas: 0,
        totalEstudiantes: 0,
        totalProfesores: 0,
        totalPersonalizaciones: 0
    });
    const [displayValues, setDisplayValues] = useState({
        partidasJugadas: '0000',
        totalEstudiantes: '0000',
        totalProfesores: '0000',
        totalPersonalizaciones: '0000'
    });
    const [isLoading, setIsLoading] = useState(true);
    const animationRefs = useRef({
        partidasJugadas: null,
        totalEstudiantes: null,
        totalProfesores: null,
        totalPersonalizaciones: null
    });
    const navigate = useNavigate();

    const images = [
        'https://cdn.ufidelitas.ac.cr/wp-content/uploads/2023/10/14161844/ODT-2382-BannesBlogs_Grados_100V.jpg',
        'https://cdn.ufidelitas.ac.cr/wp-content/uploads/2023/10/14161829/ODT-2382-BannesBlogs_EDC.jpg',
        'https://moria.aurens.com/content/blog_post/1100/1638249155-fide-genrica.png'
    ];

    // Función para generar un número aleatorio de 4 dígitos como string
    const generateRandomNumber = () => {
        return Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    };

    // Función para iniciar la animación de números aleatorios
    const startRandomAnimation = (metricKey) => {
        // Limpiar intervalo existente si hay uno
        if (animationRefs.current[metricKey]) {
            clearInterval(animationRefs.current[metricKey]);
        }

        // Iniciar nueva animación
        animationRefs.current[metricKey] = setInterval(() => {
            setDisplayValues(prev => ({
                ...prev,
                [metricKey]: generateRandomNumber()
            }));
        }, 100);
    };

    // Función para detener la animación y establecer el valor final con efecto
    const stopAnimationWithEffect = (metricKey, finalValue) => {
        const finalString = finalValue.toString().padStart(4, '0');
        
        // Limpiar el intervalo de animación aleatoria
        if (animationRefs.current[metricKey]) {
            clearInterval(animationRefs.current[metricKey]);
            animationRefs.current[metricKey] = null;
        }

        // Animación para fijar los dígitos uno por uno
        let currentStep = 0;
        const steps = 4; // Número de dígitos
        const stepDuration = 200; // Duración entre cada paso en ms

        const animateStep = () => {
            if (currentStep >= steps) {
                // Cuando todos los dígitos están fijos, establecer el valor final exacto
                setDisplayValues(prev => ({
                    ...prev,
                    [metricKey]: finalString
                }));
                return;
            }

            setDisplayValues(prev => {
                const currentDisplay = prev[metricKey].split('');
                // Fijar el dígito actual
                currentDisplay[currentStep] = finalString[currentStep];
                // Los dígitos siguientes siguen siendo aleatorios
                for (let i = currentStep + 1; i < steps; i++) {
                    currentDisplay[i] = Math.floor(Math.random() * 10);
                }
                return {
                    ...prev,
                    [metricKey]: currentDisplay.join('')
                };
            });

            currentStep++;
            setTimeout(animateStep, stepDuration);
        };

        animateStep();
    };

    // Función para obtener las métricas del backend
    const fetchMetrics = async () => {
        try {
            setIsLoading(true);
            
            // Iniciar animaciones aleatorias para todas las métricas
            Object.keys(displayValues).forEach(key => {
                startRandomAnimation(key);
            });

            const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/metricas`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener las métricas');
            }

            const data = await response.json();
            setMetrics(data);

            // Detener animaciones y establecer valores reales con efecto escalonado
            setTimeout(() => stopAnimationWithEffect('partidasJugadas', data.partidasJugadas), 0);
            setTimeout(() => stopAnimationWithEffect('totalEstudiantes', data.totalEstudiantes), 300);
            setTimeout(() => stopAnimationWithEffect('totalProfesores', data.totalProfesores), 600);
            setTimeout(() => stopAnimationWithEffect('totalPersonalizaciones', data.totalPersonalizaciones), 900);

        } catch (error) {
            console.error("Error fetching metrics:", error);
            
            // En caso de error, detener todas las animaciones y mostrar ceros
            Object.keys(displayValues).forEach(key => {
                if (animationRefs.current[key]) {
                    clearInterval(animationRefs.current[key]);
                    animationRefs.current[key] = null;
                }
            });
            
            setDisplayValues({
                partidasJugadas: '0000',
                totalEstudiantes: '0000',
                totalProfesores: '0000',
                totalPersonalizaciones: '0000'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();

        // Configurar intervalo para actualizar las métricas cada 5 minutos
        const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
        
        return () => {
            clearInterval(interval);
            // Limpiar todos los intervalos de animación al desmontar
            Object.values(animationRefs.current).forEach(interval => {
                if (interval) clearInterval(interval);
            });
        };
    }, []);

    // Slider logic
    const dots = images.map((_, index) => (
        <li
            key={index}
            className={`list__dot ${index === active ? 'dot__active' : ''}`}
            onClick={() => handleDotClick(index)}
        ></li>
    ));

    const handleNextClick = useCallback(() => {
        setActive((prev) => (prev + 1 <= images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const handlePrevClick = () => {
        setActive((prev) => (prev - 1 >= 0 ? prev - 1 : images.length - 1));
    };

    const handleDotClick = (index) => {
        setActive(index);
    };

    useEffect(() => {
        const interval = setInterval(handleNextClick, 3000);
        return () => clearInterval(interval);
    }, [active, handleNextClick]);

    return (
        <LayoutAdmin>
            <section className="main__container">
                <div className="container__top">
                    <div className="top__box">
                        <div className="box__img">
                            <i className="fa-solid fa-puzzle-piece"></i>
                        </div>
                        <div className="box__text">
                            <p className="box__name">Partidas jugadas</p>
                            <p className="box__number">{displayValues.partidasJugadas}</p>
                        </div>
                    </div>
                    <div className="top__box">
                        <div className="box__img">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <div className="box__text">
                            <p className="box__name">Estudiantes</p>
                            <p className="box__number">{displayValues.totalEstudiantes}</p>
                        </div>
                    </div>
                    <div className="top__box">
                        <div className="box__img">
                            <i className="fa-solid fa-user-tie"></i>
                        </div>
                        <div className="box__text">
                            <p className="box__name">Profesores</p>
                            <p className="box__number">{displayValues.totalProfesores}</p>
                        </div>
                    </div>
                    <div className="top__box">
                        <div className="box__img">
                            <i className="fa-solid fa-pen-ruler"></i>
                        </div>
                        <div className="box__text">
                            <p className="box__name">Personalizaciones</p>
                            <p className="box__number">{displayValues.totalPersonalizaciones}</p>
                        </div>
                    </div>
                </div>
                
                <div className="container__left">
                    <div className="left__slider">
                        <div className="slider__images" style={{ left: -active * 80 + 'vw' }}>
                            {images.map((src, index) => (
                                <img key={index} className="image__item" src={src} alt="" />
                            ))}
                        </div>
                        <div className="slider__nav">
                            <button className="nav__button button__prev" onClick={handlePrevClick}>
                                <i className="fa-solid fa-caret-left"></i>
                            </button>
                            <button className="nav__button button__next" onClick={handleNextClick}>
                                <i className="fa-solid fa-caret-right"></i>
                            </button>
                        </div>
                        <ul className="slider__list">
                            {dots}
                        </ul>
                    </div>
                </div>
                <div className="container__right">
                    <div className="right__title">
                        <h3>Accesos directos</h3>
                    </div>
                    <div className="right__box" onClick={() => navigate('/admin/history')} style={{ cursor: 'pointer' }}>
                        <div className="box__shape">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Historial</p>
                            <p className="text__description">Puedes ver el historial de las partidas.</p>
                        </div>
                    </div>
                    <div className="right__box" onClick={() => navigate('/admin/reports')} style={{ cursor: 'pointer' }}>
                        <div className="box__shape">
                            <i className="fa-solid fa-envelope-open-text"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Reportes</p>
                            <p className="text__description">Puedes ver reportes personalizados respecto al último cuatrimestre.</p>
                        </div>
                    </div>
                    <div className="right__box" onClick={() => navigate('/admin/depuration')} style={{ cursor: 'pointer' }}>
                        <div className="box__shape">
                            <i className="fa-solid fa-eraser"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Depuración</p>
                            <p className="text__description">Puedes generar una limpieza de usuarios u otros archivos.</p>
                        </div>
                    </div>
                    <div className="right__box" onClick={() => navigate('/admin/personalize_editor')} style={{ cursor: 'pointer' }}>
                        <div className="box__shape">
                            <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Personalización</p>
                            <p className="text__description">Puedes personalizar y ayudar a darle más vida a las partidas.</p>
                        </div>
                    </div>
                </div>
            </section>
        </LayoutAdmin>
    );
};

export default AdminDashboard;