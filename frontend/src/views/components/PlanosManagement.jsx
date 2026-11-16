import { usePlanos } from '../../viewmodels/use-planos';
import { formatPlanCurrency, planDailyLabel } from '../../models/plano-validation';
import { Modal } from './Modal';

export function PlanosManagement({ session, enabled = true }) {
  const vm = usePlanos(enabled, session);
  return <section className="mx-auto w-full max-w-6xl p-6 text-[var(--text)]" aria-labelledby="planos-title">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 id="planos-title" className="text-2xl font-bold">Gerenciamento de Planos</h1><p className="mt-1">Consulte e mantenha os planos disponíveis.</p></div>
      <button type="button" onClick={vm.openCreate} className="rounded-lg bg-[var(--primary)] px-4 py-3 font-semibold text-white">+ Criar Plano</button>
    </header>
    {vm.error && <p className="mb-4 rounded bg-red-50 p-3 text-red-800" role="alert">{vm.error}</p>}
    {vm.loading ? <p role="status">Carregando planos…</p> : <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left">
        <thead className="bg-slate-50"><tr>{['Plano', 'Serviço', 'Valor', 'Pacote', 'Ativo', 'Editar', 'Excluir'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
        <tbody>{vm.planos.map(plano => <tr key={plano.id} className="border-t border-slate-100">
          <td className="px-4 py-3">{plano.nome}</td><td className="px-4 py-3">{plano.nomeServico || plano.servico || '—'}</td>
          <td className="px-4 py-3">{formatPlanCurrency(plano.valor)}</td><td className="px-4 py-3">{planDailyLabel(plano.diarias)}</td>
          <td className="px-4 py-3"><label className="inline-flex items-center gap-2"><input type="checkbox" role="switch" checked={Boolean(plano.ativo)} onChange={() => void vm.toggleActive(plano)} aria-label={`Ativar ${plano.nome}`} /><span>{plano.ativo ? 'Sim' : 'Não'}</span></label></td>
          <td className="px-4 py-3"><button type="button" className="underline" onClick={() => void vm.openEdit(plano)}>Editar</button></td>
          <td className="px-4 py-3"><button type="button" className="text-red-700 underline" onClick={() => void vm.remove(plano)}>Excluir</button></td>
        </tr>)}
        {!vm.planos.length && <tr><td colSpan="7" className="px-4 py-8 text-center">Nenhum plano cadastrado.</td></tr>}</tbody>
      </table>
    </div>}
    {vm.modal && <Modal title={vm.modal.type === 'create' ? 'Criar plano' : 'Editar plano'} onClose={vm.closeModal}>
      <form className="w-[min(92vw,520px)] p-8" onSubmit={vm.save}>
        <h2 className="text-xl font-bold uppercase">{vm.modal.type === 'create' ? 'CRIAR PLANO' : 'EDITAR PLANO'}</h2><p className="mb-6 mt-1">Campos a preencher.</p>
        <label className="mb-4 block">Nome do plano<input className="mt-1 w-full rounded border p-3" value={vm.form.nome} onChange={e => vm.setField('nome', e.target.value)} maxLength="120" required />{vm.fieldErrors.nome && <span role="alert">{vm.fieldErrors.nome}</span>}</label>
        <label className="mb-4 block">Serviço<select className="mt-1 w-full rounded border p-3" value={vm.form.idServico} onChange={e => vm.setField('idServico', e.target.value)} required><option value="">Selecione um serviço</option>{vm.servicos.map(s => <option key={s.idServico} value={s.idServico}>{s.nome}</option>)}</select>{vm.fieldErrors.idServico && <span role="alert">{vm.fieldErrors.idServico}</span>}</label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">Diárias<input className="mt-1 w-full rounded border p-3" type="number" min="1" step="1" value={vm.form.diarias} onChange={e => vm.setField('diarias', e.target.value)} required />{vm.fieldErrors.diarias && <span role="alert">{vm.fieldErrors.diarias}</span>}</label>
          <label className="block">Valor<input className="mt-1 w-full rounded border p-3" inputMode="decimal" placeholder="R$ 0,00" value={vm.form.valor} onChange={e => vm.setField('valor', e.target.value)} required />{vm.fieldErrors.valor && <span role="alert">{vm.fieldErrors.valor}</span>}</label>
        </div>
        {vm.formError && <p className="mt-3 text-red-700" role="alert">{vm.formError}</p>}
        <footer className="mt-8 flex justify-end gap-3"><button type="button" className="rounded border px-4 py-2" disabled={vm.saving} onClick={vm.closeModal}>Cancelar</button><button type="submit" className="rounded bg-[var(--primary)] px-4 py-2 text-white" disabled={vm.saving}>{vm.saving ? 'Salvando…' : 'Salvar'}</button></footer>
      </form>
    </Modal>}
  </section>;
}
