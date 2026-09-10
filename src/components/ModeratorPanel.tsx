import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileUp, KeyRound, LogOut, Pencil, Plus, RefreshCw, RotateCcw, ShieldCheck, ToggleLeft, ToggleRight, Upload, Users, X } from 'lucide-react';
import { useEventTeams } from '../hooks/useEventTeams';
import { createRemoteTeam, loginOperator, logoutOperator, updateRemoteTeam } from '../lib/team-api';
import { Modal } from './ui/Modal';
import { POSTAS, getPostasCompletadasCount, getSiguientePosta } from '../utils/routing';
import { generateAvailableTeamId } from '../utils/team-id';
import { actualizarDatosEquipo, completarPostaEquipo, registrarOCrearEquipo, resetearEquipo, resetearTodoElEvento } from '../utils/storage';
import type { Equipo, PostaId } from '../types/game';

type StatusMessage = { type: 'success' | 'error' | 'warning'; text: string } | null;

const parseMembers = (value: string) => value.split(/[\n,;]+/).map((member) => member.trim()).filter(Boolean).slice(0, 20);

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  values.push(current.trim());
  return values;
}

export const ModeratorPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [search, setSearch] = useState('');
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newMembers, setNewMembers] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [memberDraft, setMemberDraft] = useState('');
  const [editStatus, setEditStatus] = useState<StatusMessage>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [quickTeamId, setQuickTeamId] = useState('');
  const [quickPostaId, setQuickPostaId] = useState<PostaId>(1);
  const { equipos, source, isLoading, error, refresh } = useEventTeams({ includeInactive: isAuthenticated });

  useEffect(() => {
    fetch('/api/operator', { headers: { Accept: 'application/json' } })
      .then((response) => response.json())
      .then((data) => {
        if (data?.authenticated) setIsAuthenticated(true);
      })
      .catch(() => undefined);
  }, []);

  const generatedId = useMemo(() => generateAvailableTeamId(equipos.map((team) => team.id)), [equipos]);

  useEffect(() => {
    setNewId((current) => {
      if (current && !equipos.some((team) => team.id === current)) return current;
      return generatedId ?? '';
    });
  }, [equipos, generatedId]);

  const filteredTeams = useMemo(() => {
    const query = search.toLowerCase().trim();
    return equipos.filter((team) => !query || team.id.includes(query) || team.nombre.toLowerCase().includes(query));
  }, [equipos, search]);

  const activeCount = equipos.filter((team) => team.active).length;
  const inactiveCount = equipos.length - activeCount;
  const editingTeam = editingId ? equipos.find((team) => team.id === editingId) ?? null : null;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setStatus(null);
    const result = await loginOperator(authPin);
    if (result.ok) {
      setIsAuthenticated(true);
      setAuthPin('');
      setStatus({ type: 'success', text: 'Sesión iniciada. La administración usará el PIN único del operador.' });
    } else {
      setStatus({ type: result.unavailable ? 'warning' : 'error', text: result.message ?? 'No se pudo iniciar la sesión de operador.' });
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await logoutOperator();
    setIsAuthenticated(false);
    setEditingId(null);
    setStatus(null);
  };

  const reserveNextId = (usedId: string) => {
    setNewId(generateAvailableTeamId([...equipos.map((team) => team.id), usedId]) ?? '');
  };

  const createTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = newId.trim();
    const name = newName.trim() || `Equipo ${id}`;
    const members = parseMembers(newMembers);
    if (!/^\d{4}$/.test(id)) {
      setStatus({ type: 'error', text: 'No hay un ID disponible para asignar. Actualiza el catálogo e inténtalo de nuevo.' });
      return;
    }
    if (equipos.some((team) => team.id === id)) {
      setStatus({ type: 'error', text: `El ID ${id} ya está ocupado. Se generará uno nuevo.` });
      reserveNextId(id);
      return;
    }
    if (name.length < 2) {
      setStatus({ type: 'error', text: 'El nombre del equipo debe tener al menos 2 caracteres.' });
      return;
    }

    try {
      const created = await createRemoteTeam({ id, name, members, active: true });
      registrarOCrearEquipo(created.id, created.name, created.members);
      setStatus({ type: 'success', text: `Equipo ${created.id} registrado y sincronizado.` });
      reserveNextId(created.id);
      await refresh();
    } catch (remoteError) {
      const localTeam = registrarOCrearEquipo(id, name, members);
      setStatus({ type: 'warning', text: `${localTeam.nombre} quedó guardado localmente porque Supabase no respondió. ${remoteError instanceof Error ? remoteError.message : ''}` });
      reserveNextId(id);
    }

    setNewName('');
    setNewMembers('');
  };

  const startEdit = (team: Equipo) => {
    setEditingId(team.id);
    setEditName(team.nombre);
    setEditMembers(team.members);
    setMemberDraft('');
    setEditStatus(null);
    setStatus(null);
  };

  const addMembers = (event?: React.FormEvent) => {
    event?.preventDefault();
    const additions = parseMembers(memberDraft);
    if (!additions.length) return;
    setEditMembers((current) => {
      const known = new Set(current.map((member) => member.toLocaleLowerCase()));
      return [...current, ...additions.filter((member) => !known.has(member.toLocaleLowerCase()))].slice(0, 20);
    });
    setMemberDraft('');
  };

  const saveEdit = async (teamId: string) => {
    const name = editName.trim();
    if (name.length < 2) {
      setEditStatus({ type: 'error', text: 'El nombre del equipo debe tener al menos 2 caracteres.' });
      return;
    }
    actualizarDatosEquipo(teamId, { nombre: name, members: editMembers });
    try {
      const updated = await updateRemoteTeam(teamId, { name, members: editMembers });
      setStatus({ type: 'success', text: `Equipo ${updated.id} actualizado y sincronizado.` });
      await refresh();
    } catch (remoteError) {
      setStatus({ type: 'warning', text: `Cambios de ${teamId} guardados localmente. ${remoteError instanceof Error ? remoteError.message : ''}` });
    }
    setEditingId(null);
  };

  const toggleTeam = async (team: Equipo) => {
    const nextActive = !team.active;
    actualizarDatosEquipo(team.id, { active: nextActive });
    try {
      await updateRemoteTeam(team.id, { active: nextActive });
      setStatus({ type: 'success', text: `${team.id} ${nextActive ? 'activado' : 'desactivado'} en Supabase.` });
      await refresh();
    } catch (remoteError) {
      setStatus({ type: 'warning', text: `Estado de ${team.id} cambiado localmente. ${remoteError instanceof Error ? remoteError.message : ''}` });
    }
  };

  const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setCsvLoading(true);
    const lines = (await file.text()).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const startIndex = lines[0]?.toLowerCase().includes('id') ? 1 : 0;
    let imported = 0;
    let skipped = 0;
    let remoteFailures = 0;
    const knownIds = new Set(equipos.map((team) => team.id));

    for (const line of lines.slice(startIndex)) {
      const [idRaw, nameRaw, membersRaw = ''] = splitCsvLine(line);
      const id = idRaw.trim();
      const name = nameRaw.trim();
      if (!/^\d{4}$/.test(id) || name.length < 2 || knownIds.has(id)) {
        skipped += 1;
        continue;
      }

      const members = parseMembers(membersRaw);
      try {
        const created = await createRemoteTeam({ id, name, members, active: true });
        registrarOCrearEquipo(created.id, created.name, created.members);
        knownIds.add(id);
        knownIds.add(created.id);
      } catch {
        registrarOCrearEquipo(id, name, members);
        knownIds.add(id);
        remoteFailures += 1;
      }
      imported += 1;
    }

    await refresh();
    setCsvLoading(false);
    setStatus({ type: remoteFailures || !imported ? 'warning' : 'success', text: `Importación terminada: ${imported} equipo(s) agregado(s), ${skipped} fila(s) omitida(s).${remoteFailures ? ` ${remoteFailures} quedó local por falta de conexión.` : ''}` });
  };

  const quickApprove = () => {
    if (!quickTeamId) {
      setStatus({ type: 'error', text: 'Selecciona un equipo para la validación rápida.' });
      return;
    }
    completarPostaEquipo(quickTeamId, quickPostaId, 100, 0, 'Aprobado desde panel de operador');
    setStatus({ type: 'success', text: `Posta ${quickPostaId} marcada como completada para ${quickTeamId}.` });
  };

  const resetTeam = (teamId: string) => {
    if (!window.confirm(`¿Reiniciar solamente el progreso de ${teamId}?`)) return;
    resetearEquipo(teamId);
    setStatus({ type: 'success', text: `Progreso de ${teamId} reiniciado. El registro del equipo se conservó.` });
  };

  const resetAll = () => {
    if (!window.confirm('¿Reiniciar el progreso de todos los equipos? Los nombres e integrantes se conservarán.')) return;
    resetearTodoElEvento();
    setStatus({ type: 'success', text: 'Progreso del evento reiniciado.' });
  };

  if (!isAuthenticated) {
    return (
      <section className="page-stack page-stack--narrow" aria-labelledby="operator-login-title">
        <div className="page-intro page-intro--compact">
          <div className="page-intro__copy">
            <span className="eyebrow">04 / ACCESO DE OPERADOR</span>
            <h1 id="operator-login-title" className="page-title">Control de equipos</h1>
            <p>Ingresa el PIN único del operador para administrar el catálogo.</p>
          </div>
        </div>
        <section className="page-panel auth-card">
          <div className="auth-card__icon"><ShieldCheck aria-hidden="true" /></div>
          <h2>Desbloquear operación</h2>
          <p>La sesión se valida exclusivamente en el servidor.</p>
          {status && <p className={`inline-notice inline-notice--${status.type}`} role="alert">{status.text}</p>}
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="field-group"><span className="field-label">PIN de operador</span><span className="field-with-icon"><KeyRound aria-hidden="true" /><input className="field-control" type="password" value={authPin} onChange={(event) => setAuthPin(event.target.value)} autoComplete="off" autoFocus placeholder="Ingresa el PIN" /></span></label>
            <button className="button button-primary" type="submit" disabled={authLoading || !authPin}>{authLoading ? 'Validando…' : 'Desbloquear panel'} <ArrowIcon /></button>
          </form>
        </section>
      </section>
    );
  }

  return (
    <section className="page-stack moderator-page" aria-labelledby="operator-title">
      <div className="page-intro page-intro--compact">
        <div className="page-intro__copy"><span className="eyebrow">04 / OPERACIÓN DE EVENTO</span><h1 id="operator-title" className="page-title">Equipos</h1><p>Registra y mantén listo el catálogo que utilizarán las Postas.</p></div>
        <div className="page-intro__actions"><span className={`data-status ${source === 'supabase' ? 'data-status--online' : ''}`}><i aria-hidden="true" />{isLoading ? 'Cargando catálogo' : source === 'supabase' ? 'Sincronizado' : 'Respaldo local'}</span><button type="button" className="control-button" onClick={() => void handleLogout()}><LogOut aria-hidden="true" /> Salir</button></div>
      </div>

      {status && <p className={`inline-notice inline-notice--${status.type}`} role="status">{status.text}</p>}
      {error && <p className="inline-notice inline-notice--warning">{error}</p>}

      <div className="moderator-layout">
        <aside className="moderator-tools page-stack" aria-label="Acciones de equipos">
          <section className="admin-panel">
            <div className="panel-heading"><div><span className="eyebrow">Alta manual</span><h2>Nuevo equipo</h2></div><Plus aria-hidden="true" color="var(--color-primary)" /></div>
            <form className="admin-form" onSubmit={createTeam}>
              <label className="field-group"><span className="field-label">ID asignado · 4 dígitos</span><input className="field-control field-control--readonly" inputMode="numeric" value={newId} readOnly aria-readonly="true" placeholder="Generando…" /><span className="field-help">Se genera automáticamente y no se puede editar.</span></label>
              <label className="field-group"><span className="field-label">Nombre del equipo</span><input className="field-control" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nombre del equipo" required /></label>
              <label className="field-group"><span className="field-label">Integrantes <span className="field-label__optional">opcional</span></span><textarea className="field-control field-control--small" value={newMembers} onChange={(event) => setNewMembers(event.target.value)} placeholder="Un nombre por línea" rows={3} /></label>
              <button type="submit" className="button button-primary" disabled={!newId}><Plus aria-hidden="true" /> Agregar equipo</button>
              <span className="field-help">Separa integrantes con comas, punto y coma o saltos de línea.</span>
            </form>
          </section>

          <section className="admin-panel admin-panel--import">
            <div className="panel-heading"><div><span className="eyebrow">Desde Forms</span><h2>Importar CSV</h2></div><FileUp aria-hidden="true" color="var(--color-primary)" /></div>
            <p className="panel-description">Columnas: <code>id,nombre,integrantes</code>.</p>
            <label className="button button-secondary button-full" style={{ cursor: csvLoading ? 'wait' : 'pointer' }}><Upload aria-hidden="true" /> {csvLoading ? 'Importando…' : 'Seleccionar CSV'}<input className="sr-only" type="file" accept=".csv,text/csv" onChange={importCsv} disabled={csvLoading} /></label>
          </section>

          <details className="admin-details">
            <summary><span><CheckCircle2 aria-hidden="true" /> Validar una posta</span><span aria-hidden="true">+</span></summary>
            <div className="admin-details__body">
              <label className="field-group"><span className="field-label">Equipo</span><select className="field-control" value={quickTeamId} onChange={(event) => setQuickTeamId(event.target.value)}><option value="">Selecciona un equipo activo</option>{equipos.filter((team) => team.active).map((team) => <option key={team.id} value={team.id}>{team.id} · {team.nombre}</option>)}</select></label>
              <label className="field-group"><span className="field-label">Estación</span><select className="field-control" value={quickPostaId} onChange={(event) => setQuickPostaId(Number(event.target.value) as PostaId)}>{POSTAS.map((posta) => <option key={posta.id} value={posta.id}>Posta {posta.id} · {posta.titulo}</option>)}</select></label>
              <button type="button" className="button button-secondary button-full" onClick={quickApprove}><CheckCircle2 aria-hidden="true" /> Marcar como lista</button>
            </div>
          </details>
        </aside>

        <section className="admin-panel admin-catalog" aria-labelledby="catalog-title">
          <div className="admin-toolbar">
            <div><span className="eyebrow">Catálogo</span><h2 id="catalog-title">Equipos <span className="mono-label">/ {equipos.length}</span></h2></div>
            <div className="admin-toolbar__actions"><button type="button" className="control-button control-button--compact" onClick={() => void refresh()} disabled={isLoading}><RefreshCw aria-hidden="true" /> Actualizar</button><button type="button" className="control-button control-button--compact control-button--danger" onClick={resetAll}><RotateCcw aria-hidden="true" /> Reiniciar progreso</button></div>
          </div>

          <div className="admin-summary" aria-label="Resumen del catálogo"><span><b>{activeCount}</b> activos</span><span><b>{inactiveCount}</b> inactivos</span><span><b>{equipos.length}</b> total</span></div>
          <label className="field-group admin-search"><span className="field-label">Buscar equipo</span><input className="field-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID o nombre" /></label>

          <div className="team-list" aria-live="polite">
            {filteredTeams.map((team) => {
              const count = getPostasCompletadasCount(team);
              const next = getSiguientePosta(team);
              return (
                <article className={`team-row ${team.active ? '' : 'team-row--inactive'}`} key={team.id}>
                  <div className="team-row__main">
                    <div className="team-row__identity"><span className="station-index">{team.id}</span><div><strong>{team.nombre}</strong><span>{team.members.length ? `${team.members.length} integrante${team.members.length === 1 ? '' : 's'}` : 'Sin integrantes'}</span></div></div>
                    <div className="team-row__members">{team.members.length ? team.members.join(' · ') : <span className="field-help">Agrega integrantes al editar.</span>}</div>
                    <div className="team-row__progress"><b>{count}/5</b><span>{next ? `Siguiente: ${next.titulo}` : 'Ruta completa'}</span></div>
                    <span className={`status-badge ${team.active ? 'status-badge--active' : 'status-badge--inactive'}`}><i aria-hidden="true" />{team.active ? 'Activo' : 'Inactivo'}</span>
                    <div className="team-row__actions">
                      <button type="button" className="row-action" onClick={() => startEdit(team)}><Pencil aria-hidden="true" /> Editar</button>
                      <button type="button" className="row-action" onClick={() => void toggleTeam(team)}>{team.active ? <ToggleLeft aria-hidden="true" /> : <ToggleRight aria-hidden="true" />} {team.active ? 'Desactivar' : 'Activar'}</button>
                      <button type="button" className="row-action" onClick={() => resetTeam(team.id)}><RotateCcw aria-hidden="true" /> Reiniciar</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!filteredTeams.length && <div className="empty-state"><Users aria-hidden="true" size={28} /><strong>{search ? 'No hay coincidencias' : 'Aún no hay equipos'}</strong><span>{search ? 'Prueba con otro ID o nombre.' : 'Registra uno manualmente o importa el CSV de Forms.'}</span></div>}
        </section>
      </div>

      {editingTeam && (
        <Modal open={Boolean(editingTeam)} onClose={() => setEditingId(null)} eyebrow={`CATÁLOGO / #${editingTeam.id}`} title="Editar equipo" titleId="edit-team-title" size="compact" closeLabel="Cerrar edición">
          <form className="edit-team-form" onSubmit={(event) => { event.preventDefault(); void saveEdit(editingTeam.id); }}>
            {editStatus && <p className={`inline-notice inline-notice--${editStatus.type}`} role="alert">{editStatus.text}</p>}
            <label className="field-group"><span className="field-label">ID</span><input className="field-control field-control--readonly" value={editingTeam.id} readOnly /></label>
            <label className="field-group"><span className="field-label">Nombre</span><input className="field-control" value={editName} onChange={(event) => setEditName(event.target.value)} /></label>
            <div className="field-group">
              <span className="field-label">Integrantes</span>
              <div className="member-editor">
                <div className="member-editor__list" aria-live="polite">
                  {editMembers.length ? editMembers.map((member, index) => <span className="member-chip" key={`${member}-${index}`}>{member}<button type="button" onClick={() => setEditMembers((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Quitar a ${member}`}><X aria-hidden="true" /></button></span>) : <span className="field-help">Aún no hay integrantes.</span>}
                </div>
                <div className="member-editor__add">
                  <input className="field-control" value={memberDraft} onChange={(event) => setMemberDraft(event.target.value)} placeholder="Nombre del integrante" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addMembers(); } }} />
                  <button type="button" className="button button-secondary" onClick={() => addMembers()}>Añadir</button>
                </div>
                <span className="field-help">Añade uno por uno; puedes quitar cualquier chip sin mover el resto de la pantalla.</span>
              </div>
            </div>
            <div className="form-actions"><button type="submit" className="button button-primary">Guardar cambios</button><button type="button" className="button button-quiet" onClick={() => setEditingId(null)}>Cancelar</button></div>
          </form>
        </Modal>
      )}
    </section>
  );
};

const ArrowIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
