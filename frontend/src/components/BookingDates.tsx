import { Fragment } from 'react';
import { formatBookingDates } from '../design/booking';
import { horizontalScrollKeys } from './horizontalScroll';

export function BookingDates({ dates, service, removeDate }: { dates: string[]; service?: string; removeDate?(date: string): void }) {
  return <div className={`booking-dates-scroll${removeDate ? ' booking-dates-editable' : ''}`} role="region" aria-label="Datas do agendamento" tabIndex={0} onKeyDown={horizontalScrollKeys}>
    {dates.length ? [...dates].sort().map((date, index) => <Fragment key={date}>
      {index > 0 && ' · '}<span className="booking-date"><span className="booking-date-label">{formatBookingDates([date])}</span>{removeDate && <button type="button" className="booking-cart-remove" aria-label={`Remover ${date} do carrinho`} onClick={() => removeDate(date)}>×</button>}</span>
    </Fragment>) : 'Nenhuma data selecionada'}
    {service && ` • ${service}`}
  </div>;
}
