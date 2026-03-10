'use client';
/**
 * @fileOverview A simple event emitter for centralizing Firestore permission errors.
 */

import { FirestorePermissionError } from './errors';

type Listener = (error: FirestorePermissionError) => void;

class ErrorEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  on(event: 'permission-error', listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: 'permission-error', listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit(event: 'permission-error', error: FirestorePermissionError) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((l) => l(error));
  }
}

export const errorEmitter = new ErrorEmitter();
