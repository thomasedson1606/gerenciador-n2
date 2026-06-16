import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FilePlus, 
  Code2, 
  Activity, 
  CheckCircle, 
  Archive, 
  PieChart, 
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import styles from './Navigation.module.css';

const navItems = [
  { path: '/', label: 'Nova Solicitação', icon: FilePlus },
  { path: '/n3', label: 'N3/Desenvolvimento', icon: Code2 },
  { path: '/fluxo', label: 'Fluxo Desenvolvimento', icon: Activity },
  { path: '/conclusao', label: 'Conclusão DEV', icon: CheckCircle },
  { path: '/concluidas', label: 'Solicitações Concluídas', icon: Archive },
  { path: '/relatorios', label: 'Relatórios', icon: PieChart },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const activeIndex = navItems.findIndex(item => item.path === location.pathname);
  const indexToUse = activeIndex !== -1 ? activeIndex : 0;

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>N2</div>
        <h2>Order Manager</h2>
      </div>
      <ul className={styles.navList}>
        <div 
          className={styles.activeIndicator} 
          style={{ transform: `translateY(calc(${indexToUse} * 48px))` }}
        />
        {navItems.map((item) => (
          <li key={item.path} className={styles.navItem}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={20} className={styles.icon} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className={styles.spacer} />
      <a
        href="https://thom-eight.vercel.app/index.html"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.portalLink}
      >
        <ExternalLink size={20} className={styles.icon} />
        <span>Voltar ao Portal</span>
      </a>
    </nav>
  );
};

