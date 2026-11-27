import { dashboardSummary } from '../../models/dashboard-model';

const percentage = (count, capacity) => capacity > 0 ? Math.min(100, count / capacity * 100) : 0;

export function DashboardOccupancy({ data }) {
    const occupancy = data && dashboardSummary(data).occupancy;
    const creche = occupancy?.find(row => row.service === 'Creche');
    const dayUse = occupancy?.find(row => row.service === 'DayUse');
    const hotel = occupancy?.find(row => row.service === 'Hotel');
    // The Creche limit is shared with Day Use; conflicting limits are not reliable.
    const sharedCapacity = creche?.capacity !== undefined && (dayUse?.capacity === undefined || dayUse.capacity === creche.capacity) ? creche.capacity : undefined;
    const sharedCount = creche && dayUse ? creche.count + dayUse.count : undefined;
    const crecheWidth = percentage(creche?.count, sharedCapacity);
    const dayUseWidth = Math.min(100 - crecheWidth, percentage(dayUse?.count, sharedCapacity));
    const display = value => value ?? '—';

    return <div className="dashboard-occupancy">
      <div className="dashboard-occupancy-group">
        <p>Creche + Day Use: {display(sharedCount)}/{display(sharedCapacity)}</p>
        <div className="dashboard-occupancy-bar" aria-hidden="true">
          <span className="dashboard-occupancy-creche" style={{ width: `${crecheWidth}%` }}/>
          <span className="dashboard-occupancy-dayuse" style={{ width: `${dayUseWidth}%` }}/>
        </div>
        <div className="dashboard-occupancy-legend">
          <span><i className="dashboard-occupancy-creche"/>Creche: {display(creche?.count)}</span>
          <span><i className="dashboard-occupancy-dayuse"/>Day Use: {display(dayUse?.count)}</span>
        </div>
      </div>
      <div className="dashboard-occupancy-group">
        <p>Hotel: {display(hotel?.count)}/{display(hotel?.capacity)}</p>
        <div className="dashboard-occupancy-bar dashboard-occupancy-hotel" aria-hidden="true">
          <span className="dashboard-occupancy-creche" style={{ width: `${percentage(hotel?.count, hotel?.capacity)}%` }}/>
        </div>
      </div>
      {data?.summary && <p className="dashboard-occupancy-note">Contagem de agendamentos por serviço; um pet pode aparecer mais de uma vez.</p>}
    </div>;
}
