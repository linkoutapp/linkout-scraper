'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DesignTokens {
  colors?: {
    primary?: string;
    text?: string;
    background?: string;
    secondary?: string;
    accent?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: number;
  };
  borderRadius?: {
    default?: number;
  };
  darkMode?: boolean;
}

export function WaitlistForm({ slug }: { slug: string }) {
  const [designTokens, setDesignTokens] = useState<DesignTokens>({});

  useEffect(() => {
    // Extract tokens from URL if in embed mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokensParam = urlParams.get('tokens');
      
      if (tokensParam) {
        try {
          const tokens = JSON.parse(decodeURIComponent(tokensParam));
          setDesignTokens(tokens);
          console.log('w8list applying design tokens:', tokens);
        } catch (e) {
          console.error('w8list failed to parse design tokens:', e);
        }
      }
    }

    // Auto-resize iframe
    function postHeight() {
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: 'w8list-resize', slug, height: document.body.scrollHeight },
          '*'
        );
      }
    }
    postHeight();
    const observer = new MutationObserver(postHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [slug]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, projectSlug: slug }),
      });

      const data = await res.json();

      if (data.error) {
        setStatus('error');
        setMessage(data.error);
      } else {
        setStatus('success');
        setMessage(data.message);
        setPosition(data.position);
        setEmail('');
        setName('');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      style={{
        fontFamily: designTokens.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        backgroundColor: designTokens.colors?.background || 'transparent',
        color: designTokens.colors?.text || 'inherit'
      }}
    >
      <div className="space-y-2">
        <Label 
          htmlFor="name"
          style={{ 
            fontFamily: designTokens.typography?.fontFamily || 'inherit',
            color: designTokens.colors?.text || 'inherit'
          }}
        >
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            fontFamily: designTokens.typography?.fontFamily || 'inherit',
            borderRadius: `${designTokens.borderRadius?.default || 6}px`,
            borderColor: designTokens.colors?.primary ? `${designTokens.colors.primary}40` : undefined
          }}
        />
      </div>
      <div className="space-y-2">
        <Label 
          htmlFor="email"
          style={{ 
            fontFamily: designTokens.typography?.fontFamily || 'inherit',
            color: designTokens.colors?.text || 'inherit'
          }}
        >
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            fontFamily: designTokens.typography?.fontFamily || 'inherit',
            borderRadius: `${designTokens.borderRadius?.default || 6}px`,
            borderColor: designTokens.colors?.primary ? `${designTokens.colors.primary}40` : undefined
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={status === 'loading'}
        size="lg"
        className="w-full"
        style={{
          backgroundColor: designTokens.colors?.primary || undefined,
          fontFamily: designTokens.typography?.fontFamily || 'inherit',
          borderRadius: `${designTokens.borderRadius?.default || 6}px`,
          border: 'none'
        }}
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </Button>

      {status === 'success' && (
        <div 
          className="rounded-lg border p-4 text-center"
          style={{
            backgroundColor: designTokens.darkMode ? '#065f46' : '#f0fdf4',
            borderColor: designTokens.darkMode ? '#047857' : '#bbf7d0',
            borderRadius: `${designTokens.borderRadius?.default || 8}px`
          }}
        >
          <p 
            className="text-sm font-medium"
            style={{ color: designTokens.darkMode ? '#86efac' : '#166534' }}
          >
            {message}
          </p>
          {position && (
            <p 
              className="text-xs mt-1"
              style={{ color: designTokens.darkMode ? '#6ee7b7' : '#16a34a' }}
            >
              You are #{position} on the list.
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div 
          className="rounded-lg border p-4 text-center"
          style={{
            backgroundColor: designTokens.darkMode ? '#7f1d1d' : '#fef2f2',
            borderColor: designTokens.darkMode ? '#991b1b' : '#fecaca',
            borderRadius: `${designTokens.borderRadius?.default || 8}px`
          }}
        >
          <p 
            className="text-sm"
            style={{ color: designTokens.darkMode ? '#fca5a5' : '#991b1b' }}
          >
            {message}
          </p>
        </div>
      )}
    </form>
  );
}
