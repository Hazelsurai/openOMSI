// The page's controls. Every text passed in is translated here (`t`), so callers write
// English, as the game's tables want it.

import { html, useEffect, useRef, useState } from '../vendor/preact-htm.js';
import { Icon } from './icons.js';
import { t } from './i18n.js';
import { onPhone } from './api.js';
import { filterOptions } from './list-filter.js';

export { html };

export function Button({ kind = '', icon, children, label, onClick, disabled, title, type = 'button', big, wide, small }) {
  const cls = ['btn', kind, big && 'big', wide && 'wide', small && 'small', icon && !children && !label && 'icon'].filter(Boolean).join(' ');
  return html`<button type=${type} class=${cls} onClick=${onClick} disabled=${disabled} title=${title ? t(title) : undefined}>
    ${icon && html`<${Icon} name=${icon} />`}${label ? t(label) : children}
  </button>`;
}

export function Card({ title, hint, actions, children, class: cls = '', body = true }) {
  return html`<section class=${'card ' + cls}>
    ${(title || actions) && html`<div class="card-head"><div><h2>${t(title)}</h2>${hint && html`<div class="hint">${t(hint)}</div>`}</div>${actions && html`<div class="row">${actions}</div>`}</div>`}
    ${body ? html`<div class="card-body">${children}</div>` : children}
  </section>`;
}

export function Field({ label, help, children }) {
  return html`<div class="field">${label && html`<label>${t(label)}</label>`}${children}${help && html`<div class="help">${t(help)}</div>`}</div>`;
}

/** A select of `options`: [value, label] pairs (labels translated unless `raw`).
 * `searchable` keeps a filter at the top of a long list (repaints, depot files). */
export function Select({ value, options, onChange, disabled, raw, placeholder, searchable }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const [place, setPlace] = useState(null);
  const [q, setQ] = useState('');
  const box = useRef();
  const list = useRef();
  const find = useRef();
  const now = String(value ?? '');
  const has = options.some(([v]) => String(v) === now);
  const items = [
    ...(has ? [] : [[now, value === '' || value == null ? t(placeholder || 'Choose…') : now]]),
    ...options.map(([v, l]) => [String(v), raw ? l : t(l)]),
  ];
  const shown = searchable ? filterOptions(items, q) : items;
  const at = items.findIndex(([v]) => v === now);
  const shut = () => {
    setOpen(false);
    setQ('');
  };
  useEffect(() => {
    if (!open) return;
    const r = box.current.getBoundingClientRect();
    const below = innerHeight - r.bottom - 12;
    const up = below < 220 && r.top > below;
    const max = Math.min(320, up ? r.top - 12 : below);
    const right = innerWidth - r.left - 12;
    const left = r.right - 12;
    const leftward = right < 420 && left > right;
    setPlace({ ...(leftward ? { right: innerWidth - r.right } : { left: r.left }), width: r.width, widest: Math.max(r.width, Math.min(420, leftward ? left : right)), max, ...(up ? { bottom: innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
    setHi(at);
    const out = (e) => !box.current?.contains(e.target) && !list.current?.contains(e.target) && shut();
    const away = (e) => !list.current?.contains(e.target) && shut();
    document.addEventListener('mousedown', out);
    document.addEventListener('scroll', away, true);
    addEventListener('resize', shut);
    return () => {
      document.removeEventListener('mousedown', out);
      document.removeEventListener('scroll', away, true);
      removeEventListener('resize', shut);
    };
  }, [open]);
  useEffect(() => {
    if (open && place) {
      list.current?.querySelectorAll('.dropdown-item')[Math.max(at, 0)]?.scrollIntoView({ block: 'nearest' });
      if (searchable) find.current?.focus();
    }
  }, [place]);
  if (onPhone) {
    const phone = searchable && !shown.some(([v]) => v === now) && at >= 0 ? [items[at], ...shown] : shown;
    const select = html`<select class="select" value=${now} disabled=${disabled} onChange=${(e) => onChange(e.currentTarget.value)}>
      ${phone.map(([v, l]) => html`<option value=${v}>${l}</option>`)}
    </select>`;
    if (!searchable) return select;
    return html`<div class="stack" style="gap:6px">
      <input class="input" value=${q} placeholder=${t('Search')} onInput=${(e) => setQ(e.currentTarget.value)} spellcheck="false" />
      ${select}
    </div>`;
  }
  const pick = (v) => {
    shut();
    if (v !== now) onChange(v);
  };
  const move = (n) => {
    const i = Math.max(0, Math.min(shown.length - 1, n));
    setHi(i);
    list.current?.querySelectorAll('.dropdown-item')[i]?.scrollIntoView({ block: 'nearest' });
  };
  const key = (e) => {
    const typing = e.target === find.current;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      shut();
    } else if (e.key === 'Tab') shut();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(hi + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (!typing && (e.key === 'Home' || e.key === 'End')) {
      e.preventDefault();
      move(e.key === 'Home' ? 0 : shown.length - 1);
    } else if (e.key === 'Enter' || (e.key === ' ' && !typing)) {
      e.preventDefault();
      if (shown[hi]) pick(shown[hi][0]);
    }
  };
  const label = items[at]?.[1] ?? '';
  return html`<div class="dropdown" ref=${box}>
    <button type="button" class=${'select' + (open ? ' open' : '')} disabled=${disabled} title=${label} aria-haspopup="listbox" aria-expanded=${open}
      onClick=${() => (open ? shut() : setOpen(true))} onKeyDown=${key}><span>${label}</span></button>
    ${open && place && html`<div class="dropdown-list" role="listbox" ref=${list}
      style=${(place.left != null ? `left:${place.left}px;` : `right:${place.right}px;`) + `min-width:${place.width}px;width:max-content;max-width:${place.widest}px;max-height:${place.max}px;` + (place.top != null ? `top:${place.top}px` : `bottom:${place.bottom}px`)}>
      ${searchable && html`<div class="dropdown-find"><input ref=${find} class="input" value=${q} placeholder=${t('Search')} spellcheck="false"
        onInput=${(e) => { setQ(e.currentTarget.value); setHi(0); }} onKeyDown=${key} /></div>`}
      ${shown.length === 0 && html`<div class="dropdown-empty">${t('No match')}</div>`}
      ${shown.map(([v, l], i) => html`<div role="option" aria-selected=${v === now} title=${l}
        class=${'dropdown-item' + (v === now ? ' on' : '') + (i === hi ? ' hi' : '')}
        onMouseMove=${() => i !== hi && setHi(i)} onMouseDown=${(e) => { e.preventDefault(); pick(v); }}>${l}</div>`)}
    </div>`}
  </div>`;
}

export function Input({ value, onInput, placeholder, type = 'text', ...rest }) {
  return html`<input class="input" type=${type} value=${value ?? ''} placeholder=${placeholder ? t(placeholder) : ''} onInput=${(e) => onInput(e.currentTarget.value)} spellcheck="false" ...${rest} />`;
}

export function Search({ value, onInput, placeholder = 'Search', autofocus }) {
  const ref = useRef();
  useEffect(() => {
    if (autofocus) ref.current?.focus();
  }, []);
  return html`<div class="search"><${Icon} name="search" /><input ref=${ref} class="input" value=${value} placeholder=${t(placeholder)} onInput=${(e) => onInput(e.currentTarget.value)} spellcheck="false" /></div>`;
}

export function Toggle({ checked, onChange, label, help, disabled }) {
  return html`<label class=${'toggle' + (disabled ? ' disabled' : '')}>
    <input type="checkbox" checked=${!!checked} disabled=${disabled} onChange=${(e) => onChange(e.currentTarget.checked)} />
    <span class="track"></span>
    ${(label || help) && html`<span class="text">${label && html`<b>${t(label)}</b>`}${help && html`<span>${t(help)}</span>`}</span>`}
  </label>`;
}

export function Segmented({ value, options, onChange, full }) {
  return html`<div class=${'segmented' + (full ? ' full' : '')}>
    ${options.map(([v, l]) => html`<button class=${v === value ? 'on' : ''} onClick=${() => onChange(v)}>${t(l)}</button>`)}
  </div>`;
}

export function Tabs({ value, options, onChange }) {
  return html`<div class="tabs">${options.map(([v, l]) => html`<button class=${v === value ? 'on' : ''} onClick=${() => onChange(v)}>${t(l)}</button>`)}</div>`;
}

/** A slider; `format` turns the value into what is shown beside the label, `help` a line under it. */
export function Slider({ label, value, min, max, step, onChange, format, help }) {
  const v = Number(value ?? min);
  // (the thumb's centre runs from half its width to the track's end less that: the fill ends
  // under it there, not at the plain percentage, which left the thumb beside the fill's end)
  const at = Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const fill = `calc(8px + (100% - 16px) * ${at})`;
  return html`<div class="slider">
    <div class="top"><span>${t(label)}</span><span>${format ? format(v) : v}</span></div>
    <input type="range" min=${min} max=${max} step=${step} value=${v} style=${`--fill:${fill}`} onInput=${(e) => onChange(Number(e.currentTarget.value))} />
    ${help && html`<div class="help">${t(help)}</div>`}
  </div>`;
}

export function Spinner() {
  return html`<span class="spinner"></span>`;
}

export function Empty({ icon = 'info', title, text, children }) {
  return html`<div class="empty"><${Icon} name=${icon} />${title && html`<b>${t(title)}</b>`}${text && html`<div>${t(text)}</div>`}${children}</div>`;
}

export function Notice({ kind = '', icon, children }) {
  return html`<div class=${'notice ' + kind}><${Icon} name=${icon || (kind ? 'alert' : 'info')} /><div class="grow">${children}</div></div>`;
}

export function Tag({ kind = '', children }) {
  return html`<span class=${'tag ' + kind}>${children}</span>`;
}

/** A dialog over the page; Escape and a click beside it close it. */
export function Dialog({ title, onClose, children, footer, wide, class: cls = '' }) {
  const box = useRef();
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && [...document.querySelectorAll('.overlay')].pop() === box.current && onClose?.();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return html`<div class="overlay" ref=${box} onMouseDown=${(e) => e.target === e.currentTarget && onClose?.()}>
    <div class=${'dialog' + (wide ? ' wide' : '') + (cls ? ' ' + cls : '')} role="dialog">
      <div class="dialog-head"><h2>${t(title)}</h2>${onClose && html`<${Button} kind="ghost" icon="x" title="Close" onClick=${onClose} />`}</div>
      <div class="dialog-body">${children}</div>
      ${footer && html`<div class="dialog-foot">${footer}</div>`}
    </div>
  </div>`;
}

/** A question with two answers; resolves true for the first. */
export function useConfirm() {
  const [q, setQ] = useState(null);
  const ask = (opts) => new Promise((resolve) => setQ({ ...opts, resolve }));
  const node = q && html`<${Dialog} title=${q.title} onClose=${() => (q.resolve(false), setQ(null))} footer=${html`
      <${Button} label="Cancel" onClick=${() => (q.resolve(false), setQ(null))} />
      <${Button} kind=${q.danger ? 'danger' : 'primary'} label=${q.yes || 'OK'} onClick=${() => (q.resolve(true), setQ(null))} />`}>
    <p class="dim">${t(q.text)}</p>
  </${Dialog}>`;
  return [ask, node];
}

/** A picture with a placeholder icon while there is none (or it failed). */
export function Picture({ src, icon = 'map', class: cls = '', children, style = '' }) {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(true), [src]);
  if (!src || !ok) return html`<div class=${'pic placeholder ' + cls} style=${style}><${Icon} name=${icon} />${children}</div>`;
  return html`<div class=${'pic ' + cls} style=${`background-image:url("${src}");${style}`}>
    <img src=${src} style="display:none" onError=${() => setOk(false)} />${children}
  </div>`;
}

export function PageHead({ title, text, actions }) {
  return html`<header class="page-head"><div><h1>${t(title)}</h1>${text && html`<p>${t(text)}</p>`}</div>${actions && html`<div class="actions">${actions}</div>`}</header>`;
}
