/**
 * Interfaces y datos de prueba para las historias de personalización de tarjetas en Storybook.
 */

export interface ProductItem {
    id: number;
    title: string;
    brand: string;
    category: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    stock: number;
    rating: {
        rate: number;
        count: number;
    };
    description: string;
    image: string;
    isFeatured?: boolean;
    freeShipping?: boolean;
}

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    department: string;
    status: 'online' | 'busy' | 'vacation';
    email: string;
    phone: string;
    location: string;
    avatar: string;
    tags: string[];
}

export const fallbackSvg =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="3" ry="3"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="m21 15-5-5L5 21"/%3E%3C/svg%3E';

export const categoryEmojis: Record<string, string> = {
    Electrónica: '📱',
    Audio: '🎧',
    Wearables: '⌚',
    Calzado: '👟',
    Computación: '💻',
    Fotografía: '📷',
    Mobiliario: '🪑',
    Accesorios: '🎒',
};

export const productsData: ProductItem[] = [
    {
        id: 1,
        title: 'Smartphone Galaxy Ultra Pro',
        brand: 'TechNova',
        category: 'Electrónica',
        price: 899.99,
        originalPrice: 1049.99,
        discount: 15,
        stock: 35,
        rating: { rate: 4.8, count: 245 },
        description: 'Pantalla Dynamic AMOLED 120Hz, cámara de 108MP con zoom óptico y batería de 5000mAh.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
        isFeatured: true,
        freeShipping: true,
    },
    {
        id: 2,
        title: 'Auriculares Wireless Studio Pro',
        brand: 'SoundCraft',
        category: 'Audio',
        price: 159.99,
        originalPrice: 199.99,
        discount: 20,
        stock: 64,
        rating: { rate: 4.9, count: 312 },
        description: 'Cancelación activa de ruido espacial, drivers de neodimio de 40mm y 35h de batería.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
        isFeatured: true,
        freeShipping: true,
    },
    {
        id: 3,
        title: 'Smartwatch Pulse Elite Track',
        brand: 'LifeSync',
        category: 'Wearables',
        price: 229.99,
        originalPrice: 269.99,
        discount: 15,
        stock: 8,
        rating: { rate: 4.6, count: 189 },
        description: 'Monitor de ECG continuo, SpO2, sensor de estrés, GPS satelital y resistencia 5 ATM.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
        isFeatured: false,
        freeShipping: true,
    },
    {
        id: 4,
        title: 'Zapatillas Velocity Running Air',
        brand: 'AeroStep',
        category: 'Calzado',
        price: 119.99,
        originalPrice: 139.99,
        discount: 14,
        stock: 82,
        rating: { rate: 4.5, count: 140 },
        description: 'Suela con espuma de retorno energético, malla tejida transpirable y tracción anti-derrape.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
        isFeatured: false,
        freeShipping: false,
    },
    {
        id: 5,
        title: 'Laptop Predator Workstation 16',
        brand: 'HyperCore',
        category: 'Computación',
        price: 1699.99,
        originalPrice: 1999.99,
        discount: 15,
        stock: 12,
        rating: { rate: 4.9, count: 96 },
        description: 'Procesador 14 núcleos de alto rendimiento, 32GB RAM DDR5 y pantalla 2.5K a 165Hz.',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop&q=80',
        isFeatured: true,
        freeShipping: true,
    },
    {
        id: 6,
        title: 'Cámara Lumix Cinema 4K Pro',
        brand: 'OptixPro',
        category: 'Fotografía',
        price: 1149.99,
        originalPrice: 1299.99,
        discount: 12,
        stock: 3,
        rating: { rate: 4.8, count: 75 },
        description: 'Sensor CMOS Full-Frame 4K/60p en 10-bit con estabilización sensor-shift en 5 ejes.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
        isFeatured: false,
        freeShipping: true,
    },
];

export const teamData: TeamMember[] = [
    {
        id: 1,
        name: 'Sofía Ramos',
        role: 'Tech Lead & Architect',
        department: 'Arquitectura & Backend',
        status: 'online',
        email: 'sofia.ramos@techcorp.io',
        phone: '+52 55 1234 5678',
        location: 'Ciudad de México, MX',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        tags: ['NestJS', 'PostgreSQL', 'Docker', 'AWS'],
    },
    {
        id: 2,
        name: 'Carlos Méndez',
        role: 'Senior Frontend Engineer',
        department: 'Web Experience',
        status: 'online',
        email: 'carlos.mendez@techcorp.io',
        phone: '+52 55 8765 4321',
        location: 'Guadalajara, MX',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        tags: ['React', 'TypeScript', 'Tailwind', 'Redux'],
    },
    {
        id: 3,
        name: 'Valeria Ortiz',
        role: 'Lead Product Designer',
        department: 'Diseño & UX',
        status: 'busy',
        email: 'valeria.ortiz@techcorp.io',
        phone: '+52 55 9988 7766',
        location: 'Monterrey, MX',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        tags: ['Figma', 'Design Systems', 'UX Research'],
    },
    {
        id: 4,
        name: 'Diego Torres',
        role: 'DevOps & Cloud Specialist',
        department: 'Infraestructura',
        status: 'vacation',
        email: 'diego.torres@techcorp.io',
        phone: '+52 55 4433 2211',
        location: 'Querétaro, MX',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        tags: ['Kubernetes', 'Terraform', 'CI/CD', 'GCP'],
    },
];
