import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal';
import { Button } from '../components/ManagementCalendar'; // Reusing a button component, or create a simple one

// Simple table component for displaying plans
export const TablePlanos = ({ planos, onToggleAtivo, onDelete }) => {
    const [columns, setColumns] = useState([
        { key: 'nome', label: 'Plano' },
        { key: 'servico', label: 'Serviço' },
        { key: 'diarias', label: 'Pacote' },
        { key: 'valor', label: 'Valor' },
        { key: 'ativo', label: 'Ativo' },
        { key: 'actions', label: 'Ações' },
    ]);

    useEffect(() => {
        // Load services for the servico column
    }, [planos]);

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="text-left">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {planos.map(plano => (
                        <tr key={plano.id} className="hover:bg-[--surface]">
                            <td className="p-[12px] font-medium">{plano.nome}</td>
                            <td className="p-[12px]">{plano.servico || '-'}</td>
                            <td className="p-[12px]">{plano.diarias} diárias</td>
                            <td className="p-[12px]">{plano.valor ? `R$ ${parseFloat(plano.valor).toFixed(2)}` : 'R$ 0,00'}</td>
                            <td className="p-[12px]">
                                <button
                                    onClick={() => onToggleAtivo(plano.id)}
                                    className="toggle-switch"
                                >
                                    {plano.ativo ? 'Sim' : 'Não'}
                                </button>
                            </td>
                            <td className="p-[12px] gap-2">
                                <button onClick={() => onDelete(plano.id)} className="btn-excluir">
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};