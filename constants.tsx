
import React from 'react';
import { MenuItem } from './types.ts';

export const OPERATIONAL_HOURS = {
  start: 9, // 09:00
  end: 17,  // 17:00
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Flash Burger',
    description: 'Juicy beef patty, flash-seared for maximum flavor.',
    price: 180,
    image: 'https://picsum.photos/seed/burger/400/300',
    category: 'Mains'
  },
  {
    id: '2',
    name: 'Nitro Pasta',
    description: 'Penne in spicy arrabbiata sauce, made in 7 minutes.',
    price: 220,
    image: 'https://picsum.photos/seed/pasta/400/300',
    category: 'Mains'
  },
  {
    id: '3',
    name: 'Sonic Salad',
    description: 'Fresh garden greens with lemon-zest dressing.',
    price: 150,
    image: 'https://picsum.photos/seed/salad/400/300',
    category: 'Sides'
  },
  {
    id: '4',
    name: 'Bolt Beverage',
    description: 'Freshly squeezed orange juice with ginger kick.',
    price: 90,
    image: 'https://picsum.photos/seed/juice/400/300',
    category: 'Drinks'
  }
];

export const Icons = {
  Flash: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 10V3L4 14H11V21L20 10H13Z" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  History: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  LogOut: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};
