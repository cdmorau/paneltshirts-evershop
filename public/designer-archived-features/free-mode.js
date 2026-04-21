/**
 * FREE MODE — Archived code extracted from designer.html
 *
 * This file contains all free-mode specific logic that was removed during
 * the UI redesign. Kept for reference/future use.
 */

// ══════════════════════════════════════════════════════
//  STORE: Free mode actions (cases in dispatch switch)
// ══════════════════════════════════════════════════════

/*
// Initial state with free mode fields:
let _s = { root: PM.leaf(), selectedId: null, freeMode: false, freeEls: [], selFreeId: null };

// CLEAR case reset:
_s = { root: PM.leaf(), selectedId: null, freeMode: false, freeEls: [], selFreeId: null };

// Store dispatch cases:
case 'ENTER_FREE':
  _s.freeMode   = true;
  _s.selFreeId  = null;
  // Si se pasan elementos (conversión desde grid), usarlos como estado inicial
  if (action.els) _s.freeEls = action.els;
  break;
case 'EXIT_FREE':
  _s.freeMode = false; _s.selFreeId = null;
  break;
case 'FREE_ADD':
  _s.freeEls = [..._s.freeEls, action.el];
  break;
case 'FREE_DEL':
  _s.freeEls = _s.freeEls.filter(e => e.id !== action.id);
  if (_s.selFreeId === action.id) _s.selFreeId = null;
  break;
case 'FREE_MOVE':
  _s.freeEls = _s.freeEls.map(e =>
    e.id === action.id ? { ...e, x: action.x, y: action.y } : e);
  break;
case 'FREE_RESIZE':
  _s.freeEls = _s.freeEls.map(e =>
    e.id === action.id ? { ...e, ...action.patch } : e);
  break;
case 'FREE_SEL':
  _s.selFreeId = action.id;
  _notify(); return;   // sin entrada en historial
case 'FREE_FRONT': {
  const mz = Math.max(1, ..._s.freeEls.map(e => e.z || 1));
  _s.freeEls = _s.freeEls.map(e =>
    e.id === action.id ? { ...e, z: mz + 1 } : e);
  break;
}
case 'FREE_MOVE_ALL':
  // Desplazar todos los elementos del workspace en la misma dirección y distancia
  _s.freeEls = _s.freeEls.map(e => ({ ...e, x: e.x + action.dx, y: e.y + action.dy }));
  break;
*/

// ══════════════════════════════════════════════════════
//  RENDERER: Free mode state variables
// ══════════════════════════════════════════════════════

/*
// In Renderer closure:

// ── Estado de drag/resize/rotate en modo libre ──────────────────
// _fdState sobrevive a los re-renders porque vive en la closure del Renderer.
// Los listeners de pointermove/pointerup se añaden a `document` (no al div),
// por eso tampoco se pierden cuando _canvas.innerHTML = '' destruye el div.
let _fdState  = null;   // { id, x?, y?, w?, h?, rot? } — override visual durante drag
let _fdActive = false;  // guard: evita que Store.subscribe dispare render durante drag
let _fdRafId  = null;   // ID de requestAnimationFrame para batching

function _fdRender() {
  if (_fdRafId) return;
  _fdRafId = requestAnimationFrame(() => {
    _fdRafId = null;
    render(Store.state);
  });
}

// In return object:
return { render, init, updateSize, freeDragActive: () => _fdActive, getLeafBounds };
*/

// ══════════════════════════════════════════════════════
//  RENDERER: _renderFree function
// ══════════════════════════════════════════════════════

function _renderFree(state, frag) {
  _canvas.classList.add('free-mode');
  // El borde del canvas (#canvas) ya delimita el área de impresión — no necesitamos overlay adicional.

  const sorted = [...(state.freeEls || [])].sort((a, b) => (a.z || 1) - (b.z || 1));

  if (!sorted.length) {
    const hint = document.createElement('div');
    hint.className = 'free-drop-hint';
    hint.textContent = 'Arrastra imágenes desde la galería';
    frag.appendChild(hint);
  }

  for (const origEl of sorted) {
    // live = origEl con override visual temporal aplicado si es el elemento activo
    const live = (_fdState?.id === origEl.id) ? { ...origEl, ..._fdState } : origEl;

    const x = live.x * _cW, y = live.y * _cH;
    const w = live.w * _cW, h = live.h * _cH;
    const isSel = state.selFreeId === origEl.id;

    const div = document.createElement('div');
    div.className = 'free-el' + (isSel ? ' sel' : '');
    div.dataset.fid = origEl.id;
    div.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;` +
                        `z-index:${live.z||1};transform:rotate(${live.rot||0}deg);`;

    // Imagen
    if (origEl.imgId != null && origEl.imgId < IMAGES.length) {
      const imgEl = document.createElement('img');
      imgEl.src = IMAGES[origEl.imgId]?.src || '';
      imgEl.draggable = false;
      div.appendChild(imgEl);
    }

    // Botón eliminar (visible al hover/selección)
    const del = document.createElement('button');
    del.className = 'cell-del'; del.textContent = '✕';
    del.addEventListener('pointerdown', e => e.stopPropagation());
    del.addEventListener('click', e => {
      e.stopPropagation();
      const imgId = Store.state.freeEls.find(f => f.id === origEl.id)?.imgId;
      if (imgId != null) setImageCount(imgId, Math.max(0, (IMAGE_COUNTS.get(imgId)||0) - 1));
      Store.dispatch({ type: 'FREE_DEL', id: origEl.id });
    });
    div.appendChild(del);

    // Handles de resize (visibles al seleccionar)
    for (const corner of ['nw','ne','se','sw']) {
      const rh = document.createElement('div');
      rh.className = `free-rh free-rh-${corner}`;
      // RESIZE: listeners en document — sobreviven a re-renders
      rh.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        _fdActive = true;
        Store.dispatch({ type: 'FREE_SEL', id: origEl.id });
        const { x: ox, y: oy, w: ow, h: oh } = origEl;
        const startX = e.clientX, startY = e.clientY;

        function onMove(ev) {
          const dx = (ev.clientX - startX) / _cW;
          const dy = (ev.clientY - startY) / _cH;
          let nx=ox, ny=oy, nw=ow, nh=oh;
          if (corner.includes('e')) nw = Math.min(1 - ox, Math.max(0.04, ow + dx));
          if (corner.includes('s')) nh = Math.min(1 - oy, Math.max(0.04, oh + dy));
          if (corner.includes('w')) {
            const raw = Math.max(0.04, ow - dx);
            nx = Math.max(0, ox + ow - raw);
            nw = raw;
          }
          if (corner.includes('n')) {
            const raw = Math.max(0.04, oh - dy);
            ny = Math.max(0, oy + oh - raw);
            nh = raw;
          }
          _fdState = { id: origEl.id, x: nx, y: ny, w: nw, h: nh };
          _fdRender();
        }
        function onUp() {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup',   onUp);
          _fdActive = false;
          if (_fdState) {
            const { x, y, w, h } = _fdState;
            Store.dispatch({ type: 'FREE_RESIZE', id: origEl.id, patch: {x,y,w,h} });
            _fdState = null;
          }
        }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup',   onUp);
      });
      div.appendChild(rh);
    }

    // Handle de rotación (visible al seleccionar, encima del elemento)
    const rotH = document.createElement('div');
    rotH.className = 'free-rot';
    rotH.addEventListener('pointerdown', e => {
      e.stopPropagation(); e.preventDefault();
      _fdActive = true;
      Store.dispatch({ type: 'FREE_SEL', id: origEl.id });
      // Centro del elemento en coordenadas de pantalla
      const canvasRect = _canvas.getBoundingClientRect();
      const cx = (origEl.x + origEl.w / 2) * _cW + canvasRect.left;
      const cy = (origEl.y + origEl.h / 2) * _cH + canvasRect.top;
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const initRot = origEl.rot || 0;

      function onMove(ev) {
        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        let newRot = ((initRot + (angle - startAngle) * 180 / Math.PI) % 360 + 360) % 360;
        if (ev.shiftKey) newRot = Math.round(newRot / 15) * 15;
        _fdState = { id: origEl.id, rot: newRot };
        _fdRender();
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup',   onUp);
        _fdActive = false;
        if (_fdState) {
          Store.dispatch({ type: 'FREE_RESIZE', id: origEl.id,
                           patch: { rot: _fdState.rot } });
          _fdState = null;
        }
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup',   onUp);
    });
    div.appendChild(rotH);


    // MOVER: listeners en document — sobreviven a re-renders
    div.addEventListener('pointerdown', e => {
      if (e.target.classList.contains('free-rh') ||
          e.target.classList.contains('free-rot') ||
          e.target.classList.contains('cell-del')) return;
      e.stopPropagation();
      _fdActive = true;
      Store.dispatch({ type: 'FREE_SEL',   id: origEl.id });
      Store.dispatch({ type: 'FREE_FRONT', id: origEl.id });

      const ox = origEl.x, oy = origEl.y;
      const ow = origEl.w, oh = origEl.h;
      const startX = e.clientX, startY = e.clientY;

      function onMove(ev) {
        // Sin clamping estricto — el elemento puede salir del canvas y queda recortado
        const nx = ox + (ev.clientX - startX) / _cW;
        const ny = oy + (ev.clientY - startY) / _cH;
        _fdState = { id: origEl.id, x: nx, y: ny };
        _fdRender();
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup',   onUp);
        _fdActive = false;
        if (_fdState) {
          Store.dispatch({ type: 'FREE_MOVE', id: origEl.id,
                           x: _fdState.x, y: _fdState.y });
          _fdState = null;
        }
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup',   onUp);
    });

    frag.appendChild(div);
  }
}

// ══════════════════════════════════════════════════════
//  RENDERER: getLeafBounds function
// ══════════════════════════════════════════════════════

/*
function getLeafBounds() {
  if (!_cW || !_cH) return [];
  const m = MARGIN;
  const leaves = [];

  function collect(node, x, y, w, h) {
    if (!node) return;
    if (node.type === 'leaf') {
      if (node.imageId != null) {
        leaves.push({
          imageId:  node.imageId,
          rotation: node.rotation || 0,
          x, y, w, h,
        });
      }
      return;
    }
    // Usar el ratio almacenado (no el override de drag, que no está activo aquí)
    const r = node.ratio;
    if (node.dir === 'h') {
      const my = y + h * r;
      collect(node.children[0], x, y,  w, my - y);
      collect(node.children[1], x, my, w, (y + h) - my);
    } else {
      const mx = x + w * r;
      collect(node.children[0], x,  y, mx - x,     h);
      collect(node.children[1], mx, y, (x + w) - mx, h);
    }
  }

  collect(Store.state.root, m, m, _cW - 2 * m, _cH - 2 * m);

  // Normalizar a coordenadas [0,1] del canvas completo
  return leaves.map(l => ({
    imageId:  l.imageId,
    rotation: l.rotation,
    x: l.x / _cW,
    y: l.y / _cH,
    w: l.w / _cW,
    h: l.h / _cH,
  }));
}
*/

// ══════════════════════════════════════════════════════
//  TshirtPreview: _screenPrintSize function
// ══════════════════════════════════════════════════════

/*
// ── Tamaño proyectado del área de impresión en píxeles de pantalla ──────────
// Se usa en modo libre para convertir delta de arrastre → delta de canvas
// con la misma proporción que el área de impresión aparece en el viewport.
function _screenPrintSize() {
  if (!_cam || !_ren) return null;
  const W = _printMaxW * _printScale, H = _printMaxH * _printScale;
  const cx = _offX, cy = _baseY + _offY, cz = _printZ;
  const pL = new THREE.Vector3(cx - W/2, cy, cz).project(_cam);
  const pR = new THREE.Vector3(cx + W/2, cy, cz).project(_cam);
  const pT = new THREE.Vector3(cx, cy + H/2, cz).project(_cam);
  const pB = new THREE.Vector3(cx, cy - H/2, cz).project(_cam);
  const rect = _ren.domElement.getBoundingClientRect();
  return {
    w: Math.max(1, Math.abs(pR.x - pL.x) / 2 * rect.width),
    h: Math.max(1, Math.abs(pT.y - pB.y) / 2 * rect.height),
  };
}
*/

// ══════════════════════════════════════════════════════
//  TshirtPreview: pointermove free mode branch
// ══════════════════════════════════════════════════════

/*
// Inside pointermove handler (capture phase):
if (Store.state.freeMode && Store.state.freeEls?.length) {
  // ── MODO LIBRE: mover elementos en el canvas ────────────────────────
  // NO se cambia _offX/_offY → el área de impresión permanece fija en la camisa.
  // El delta screen → canvas usa la proyección real del área de impresión.
  const screenDX = e.clientX - _prevDragX;
  const screenDY = e.clientY - _prevDragY;
  _prevDragX = e.clientX;
  _prevDragY = e.clientY;

  const size = _screenPrintSize();
  if (size && (Math.abs(screenDX) > 0.5 || Math.abs(screenDY) > 0.5)) {
    // screenDX/size.w = fracción del área de impresión recorrida = delta canvas
    const dx =  screenDX / size.w;
    const dy =  screenDY / size.h;  // canvas Y↓ = screen Y↓ → mismo signo
    Store.dispatch({ type: 'FREE_MOVE_ALL', dx, dy });
    redrawPrint(Store.state);
  }
}
*/

// ══════════════════════════════════════════════════════
//  TshirtPreview: redrawPrint free mode branch
// ══════════════════════════════════════════════════════

/*
// Inside redrawPrint(), before the BSP branch:
if (state.freeMode && state.freeEls?.length) {
  // Modo libre: contener la imagen (contain) igual que en modo panel.
  // Esto garantiza que la camiseta muestre exactamente lo mismo que el canvas 2D.
  const sorted = [...state.freeEls].sort((a, b) => (a.z || 1) - (b.z || 1));
  for (const el of sorted) {
    const domImg = document.querySelector(`.thumb[data-img-id="${el.imgId}"] img`);
    if (!domImg || !domImg.complete || !domImg.naturalWidth) continue;

    const cx = el.x * W, cy = el.y * H, cw = el.w * W, ch = el.h * H;
    const iW = domImg.naturalWidth, iH = domImg.naturalHeight;
    const rot = ((el.rot || 0) + (IMAGES[el.imgId]?.rotation || 0)) % 360;
    const θ = rot * Math.PI / 180;
    const sinT = Math.abs(Math.sin(θ)), cosT = Math.abs(Math.cos(θ));

    // contain: escalar para que la imagen quepa completamente en la celda
    const scale = Math.min(cw / (iW * cosT + iH * sinT),
                           ch / (iW * sinT + iH * cosT));
    const dw = iW * scale, dh = iH * scale;
    const dx = cx + (cw - dw) / 2, dy = cy + (ch - dh) / 2;

    _printCtx.save();
    _printCtx.beginPath();
    _printCtx.rect(cx, cy, cw, ch);
    _printCtx.clip();
    _printCtx.translate(cx + cw / 2, cy + ch / 2);
    if (rot) _printCtx.rotate(θ);
    _printCtx.drawImage(domImg, -dw / 2, -dh / 2, dw, dh);
    _printCtx.restore();
  }
} else {
  // BSP branch (panel mode)...
}
*/

// ══════════════════════════════════════════════════════
//  TshirtPreview: _resizePrintCanvas free mode branch
// ══════════════════════════════════════════════════════

/*
// Inside _resizePrintCanvas():
if (Store.state.freeMode) {
  // Modo libre: el canvas de textura cubre la superficie de impresión completa
  const refH = Math.round((PROP_H || 11) * SCALE);   // mantener resolución vertical
  h = refH;
  w = Math.round(refH * _printMaxW / _printMaxH);
}
*/

// ══════════════════════════════════════════════════════
//  TshirtPreview: _getDecalDims free mode branch
// ══════════════════════════════════════════════════════

/*
// Inside _getDecalDims():
if (Store.state.freeMode) {
  // Modo libre: el decal cubre la superficie de impresión completa
  return { pw: _printMaxW * _printScale, ph: _printMaxH * _printScale };
}
*/

// ══════════════════════════════════════════════════════
//  TshirtPreview: _updatePrintScale with free mode
// ══════════════════════════════════════════════════════

/*
let _lastFreeMode = false;
function _updatePrintScale() {
  const modeChanged = Store.state.freeMode !== _lastFreeMode;
  if (!modeChanged && PROP_W === _lastPropW && PROP_H === _lastPropH) return;
  _lastPropW = PROP_W; _lastPropH = PROP_H;
  _lastFreeMode = Store.state.freeMode;
  if (_useDecal) _rebuildDecal();
  else           _updatePlaneScale();
}
*/

// ══════════════════════════════════════════════════════
//  _sizeCanvas: free mode branch
// ══════════════════════════════════════════════════════

/*
// Inside _sizeCanvas():
// En modo libre el canvas representa la superficie de impresión completa de la camisa
let propR;
if (Store.state.freeMode) {
  const ps = TshirtPreview.getPrintSurface();
  propR = ps.maxW / ps.maxH;
} else {
  propR = PROP_W / PROP_H;
}
*/

// ══════════════════════════════════════════════════════
//  init(): btn-clean handler
// ══════════════════════════════════════════════════════

/*
document.getElementById('btn-clean').addEventListener('click', function() {
  const hidden = document.getElementById('canvas').classList.toggle('clean');
  this.title   = hidden ? 'Mostrar divisores' : 'Ocultar divisores';
  this.classList.toggle('active', hidden);
});
*/

// ══════════════════════════════════════════════════════
//  init(): _btnFree click handler
// ══════════════════════════════════════════════════════

/*
_btnFree.addEventListener('click', () => {
  if (Store.state.freeMode) {
    // Libre → Panel: convierte posiciones actuales → cuadrícula BSP
    _exitFreeMode(true);
    // render y updateToolbar se disparan por Store.subscribe
  } else {
    // Panel → Libre: convierte BSP actual → elementos libres.
    const leaves  = Renderer.getLeafBounds();
    const ps      = TshirtPreview.getPrintSurface();   // { maxW, maxH, scale }
    const decal   = TshirtPreview.getDecalDims();       // { pw, ph } del panel actual
    const off     = TshirtPreview.getOffset();           // { x, y } desplazamiento actual

    const freeW   = ps.maxW;
    const freeH   = ps.maxH;
    const scaleW  = decal.pw / freeW;
    const scaleH  = decal.ph / freeH;

    const baseX   = (1 - scaleW) / 2 + off.x / freeW;
    const baseY   = (1 - scaleH) / 2 - off.y / freeH;

    const freeEls = leaves.map((l, i) => ({
      id: uid(), imgId: l.imageId,
      x: baseX + l.x * scaleW,
      y: baseY + l.y * scaleH,
      w: l.w * scaleW,
      h: l.h * scaleH,
      rot: l.rotation || 0, z: i + 1,
    }));

    _savedPanelPrint = { x: off.x, y: off.y, scale: ps.scale };

    Store.dispatch({ type: 'ENTER_FREE', els: freeEls });
    TshirtPreview.setOffset(0, 0);
    TshirtPreview.setScale(1.0);
    _sizeCanvas();
    Renderer.render(Store.state);
    TshirtPreview.redrawPrint();
  }
});
*/

// ══════════════════════════════════════════════════════
//  init(): free mode keyboard shortcuts
// ══════════════════════════════════════════════════════

/*
let _freeClip = null;  // clipboard interno del modo libre

document.addEventListener('keydown', e => {
  if (!Store.state.freeMode) return;
  if (e.target.matches('input,textarea')) return;
  const ctrl = e.ctrlKey || e.metaKey;

  if (ctrl && e.key === 'c') {
    const el = Store.state.freeEls.find(f => f.id === Store.state.selFreeId);
    if (el) { _freeClip = { ...el }; e.preventDefault(); }
  }

  if (ctrl && (e.key === 'v' || e.key === 'd')) {
    const src = (e.key === 'd')
      ? Store.state.freeEls.find(f => f.id === Store.state.selFreeId)
      : _freeClip;
    if (!src) { e.preventDefault(); return; }
    const maxZ = Math.max(1, ...(Store.state.freeEls||[]).map(f => f.z||1));
    const newEl = { ...src, id: uid(),
      x: Math.min(0.95 - src.w, src.x + 0.03),
      y: Math.min(0.95 - src.h, src.y + 0.03),
      z: maxZ + 1 };
    Store.dispatch({ type: 'FREE_ADD', el: newEl });
    Store.dispatch({ type: 'FREE_SEL', id: newEl.id });
    if (newEl.imgId != null)
      setImageCount(newEl.imgId, (IMAGE_COUNTS.get(newEl.imgId)||0) + 1);
    e.preventDefault();
  }

  if ((e.key === 'Delete' || e.key === 'Backspace') && Store.state.selFreeId) {
    const el = Store.state.freeEls.find(f => f.id === Store.state.selFreeId);
    if (el) {
      if (el.imgId != null)
        setImageCount(el.imgId, Math.max(0, (IMAGE_COUNTS.get(el.imgId)||0) - 1));
      Store.dispatch({ type: 'FREE_DEL', id: el.id });
      e.preventDefault();
    }
  }
});
*/

// ══════════════════════════════════════════════════════
//  init(): free mode drag/drop on canvas
// ══════════════════════════════════════════════════════

/*
// Deselect al clic en fondo del canvas en modo libre
_canvas.addEventListener('pointerdown', e => {
  if (!Store.state.freeMode) return;
  if (!e.target.closest('.free-el')) {
    if (Store.state.selFreeId !== null)
      Store.dispatch({ type: 'FREE_SEL', id: null });
  }
});

// Drop de imágenes desde galería en modo libre
_canvas.addEventListener('dragover', e => {
  if (!Store.state.freeMode) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
});
_canvas.addEventListener('drop', e => {
  if (!Store.state.freeMode) return;
  e.preventDefault();
  const imgId = parseInt(e.dataTransfer.getData('text/plain'));
  if (isNaN(imgId) || !IMAGES[imgId]) return;

  const rect = _canvas.getBoundingClientRect();
  const cW = _canvas.clientWidth, cH = _canvas.clientHeight;
  const img = IMAGES[imgId];
  const defaultW = 0.35;
  const defaultH = defaultW / Math.max(0.1, img.ratio || 1) * (cW / cH);

  const cx = (e.clientX - rect.left) / cW;
  const cy = (e.clientY - rect.top)  / cH;
  const maxZ = Math.max(1, ...(Store.state.freeEls || []).map(f => f.z || 1));

  Store.dispatch({
    type: 'FREE_ADD',
    el: {
      id: uid(),
      imgId,
      x: Math.max(0, Math.min(1 - defaultW, cx - defaultW / 2)),
      y: Math.max(0, Math.min(1 - defaultH, cy - defaultH / 2)),
      w: defaultW,
      h: Math.max(0.05, defaultH),
      rot: 0,
      z: maxZ + 1,
    }
  });
  setImageCount(imgId, (IMAGE_COUNTS.get(imgId) || 0) + 1);
  TshirtPreview.redrawPrint();
});
*/

// ══════════════════════════════════════════════════════
//  Free → Grid conversion functions
// ══════════════════════════════════════════════════════

/** ¿Dos rectángulos (normalizados [0,1]) se solapan? */
function _rectsOverlap(a, b) {
  const EPS = 1e-4;
  return !(a.x + a.w <= b.x + EPS || b.x + b.w <= a.x + EPS ||
           a.y + a.h <= b.y + EPS || b.y + b.h <= a.y + EPS);
}

/**
 * Agrupa elementos solapados en "bloques":
 *  - Bloque simple  {single, x, y, w, h}     → un elemento, ningún solapamiento
 *  - Bloque múltiple {multi, x, y, w, h}      → bounding box de un grupo solapado
 */
function _computeBlocks(freeEls) {
  const n = freeEls.length;
  const p = Array.from({length: n}, (_, i) => i);
  const find = i => { while (p[i] !== i) { p[i] = p[p[i]]; i = p[i]; } return i; };
  const union = (a, b) => { p[find(a)] = find(b); };

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (_rectsOverlap(freeEls[i], freeEls[j])) union(i, j);

  const map = new Map();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!map.has(r)) map.set(r, []);
    map.get(r).push(freeEls[i]);
  }

  return [...map.values()].map(group => {
    if (group.length === 1) {
      return { single: group[0], x: group[0].x, y: group[0].y,
               w: group[0].w, h: group[0].h };
    }
    const bx = Math.min(...group.map(e => e.x));
    const by = Math.min(...group.map(e => e.y));
    const x2 = Math.max(...group.map(e => e.x + e.w));
    const y2 = Math.max(...group.map(e => e.y + e.h));
    return { multi: group, x: bx, y: by, w: x2 - bx, h: y2 - by };
  });
}

/** Ratio efectivo de una imagen libre (considera rotación 90/270°). */
function _freeElemRatio(el) {
  const img = IMAGES[el.imgId];
  if (!img) return 1;
  const rot = (el.rot || 0) % 360;
  const r   = Math.max(0.1, img.ratio || 1);
  return (rot === 90 || rot === 270) ? 1 / r : r;
}

/** Convierte un array de imgs {id,ratio} a BSP. Guarda ante rows vacío. */
function _imgsToBSP(imgs, targetR) {
  const valid = imgs.filter(i => i.id != null && IMAGES[i.id]);
  if (!valid.length) return PM.leaf();
  const { rows, normH } = findBestRowPacking(shuffleArray(valid),
                                             Math.max(0.1, targetR));
  if (!rows.length) return PM.leaf();
  return buildRowsBSP(rows, normH);
}

function _blocksToNode(blocks, rx, ry, rw, rh) {
  if (!blocks.length) return PM.leaf();

  if (blocks.length === 1) {
    const b = blocks[0];
    if (b.single) {
      const leaf = PM.leaf(b.single.imgId);
      if (b.single.rot) leaf.rotation = b.single.rot;
      return leaf;
    }
    // Grupo solapado: auto-layout en la región actual
    const imgs = b.multi
      .filter(e => e.imgId != null && IMAGES[e.imgId])
      .map(e => ({ id: e.imgId, ratio: _freeElemRatio(e) }));
    return _imgsToBSP(imgs, rw / Math.max(rh, 0.01));
  }

  const EPS       = 1e-4;
  const totalArea = blocks.reduce((s, b) => s + b.w * b.h, 0) || 1;
  let bestCut = null, bestScore = Infinity;

  function tryCut(dir, pos) {
    const g1 = [], g2 = [];
    for (const b of blocks) {
      const start = dir === 'h' ? b.y : b.x;
      const end   = start + (dir === 'h' ? b.h : b.w);
      if (end   <= pos + EPS) g1.push(b);
      else if (start >= pos - EPS) g2.push(b);
      else return;
      if (!g1.length || !g2.length) return;
      const score = Math.abs(g1.reduce((s, b) => s + b.w * b.h, 0) / totalArea - 0.5);
      if (score < bestScore) { bestScore = score; bestCut = { dir, pos, g1, g2 }; }
    }
  }

  for (const b of blocks) {
    tryCut('h', b.y);     tryCut('h', b.y + b.h);
    tryCut('v', b.x);     tryCut('v', b.x + b.w);
    if (b.multi) {
      for (const e of b.multi) {
        tryCut('h', e.y);     tryCut('h', e.y + e.h);
        tryCut('v', e.x);     tryCut('v', e.x + e.w);
      }
    }
  }

  if (!bestCut) {
    const allImgs = blocks.flatMap(b =>
      b.single
        ? [{ id: b.single.imgId, ratio: _freeElemRatio(b.single) }]
        : b.multi.map(e => ({ id: e.imgId, ratio: _freeElemRatio(e) }))
    );
    return _imgsToBSP(allImgs, rw / Math.max(rh, 0.01));
  }

  const { dir, pos, g1, g2 } = bestCut;
  if (dir === 'h') {
    const ratio  = clamp((pos - ry) / rh, 0.08, 0.92);
    const splitY = ry + rh * ratio;
    return {
      id: uid(), type: 'split', dir: 'h', ratio,
      children: [
        _blocksToNode(g1, rx, ry,     rw, splitY - ry),
        _blocksToNode(g2, rx, splitY, rw, (ry + rh) - splitY)
      ]
    };
  }
  const ratio  = clamp((pos - rx) / rw, 0.08, 0.92);
  const splitX = rx + rw * ratio;
  return {
    id: uid(), type: 'split', dir: 'v', ratio,
    children: [
      _blocksToNode(g1, rx,     ry, splitX - rx,     rh),
      _blocksToNode(g2, splitX, ry, (rx + rw) - splitX, rh)
    ]
  };
}

/** Punto de entrada: convierte freeEls actuales → árbol BSP. */
function _freeToGrid() {
  const freeEls = Store.state.freeEls;
  if (!freeEls?.length) return PM.leaf();
  const blocks = _computeBlocks(freeEls);
  return _blocksToNode(blocks, 0, 0, 1, 1);
}

let _savedPanelPrint = null;   // offset + escala guardados al entrar en modo libre

function _exitFreeMode(convertLayout = false) {
  if (convertLayout && Store.state.freeEls?.length) {
    let newRoot;
    try {
      newRoot = _freeToGrid();
    } catch (err) {
      console.error('[free→grid]', err);
      newRoot = null; // fallback: restaurar BSP anterior
    }
    Store.dispatch({ type: 'EXIT_FREE' });
    if (newRoot) Store.dispatch({ type: 'SET_ROOT', root: newRoot });
  } else {
    Store.dispatch({ type: 'EXIT_FREE' });
  }
  // Restaurar offset y escala que tenía el panel antes de entrar en modo libre
  if (_savedPanelPrint) {
    TshirtPreview.setOffset(_savedPanelPrint.x, _savedPanelPrint.y);
    TshirtPreview.setScale(_savedPanelPrint.scale);
    _savedPanelPrint = null;
  }
  fitCanvas();
}
