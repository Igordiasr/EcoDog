import { formatMoney, type BookingCart as Cart } from '../services/booking-cart';
import { horizontalScrollKeys } from './horizontalScroll';
import { BookingDates } from './BookingDates';

export function BookingCartItems({ cart, removeDate }: { cart: Cart; removeDate(date: string): void }) {
  return <div className="booking-cart-items" role="list" aria-label="Itens do carrinho" tabIndex={0} onKeyDown={horizontalScrollKeys}>
    {!cart.items.length && <p>Nenhuma contratação selecionada.</p>}
    {cart.items.map(item => <div key={item.id} className="booking-cart-row" role="listitem">
      <div className="booking-cart-details"><strong>{item.service === 'DayUse' ? 'Day Use' : item.service}</strong>
        <span>{item.kind === 'daily' ? item.date.split('-').reverse().join('/') : `${item.frequency} ${item.frequency === 1 ? 'vez' : 'vezes'} por semana • ${item.month.split('-').reverse().join('/')}`}</span>
      </div>
      <div className="booking-cart-prices"><strong className="booking-cart-price">{formatMoney(item.priceCents)}</strong>{item.service !== 'Hotel' && <span>{formatMoney(item.unitPriceCents)} / pet × {item.petCount}</span>}</div>
      {item.kind === 'daily' && <button type="button" className="booking-cart-remove" aria-label={`Remover ${item.date} do carrinho`} onClick={() => removeDate(item.date)}>×</button>}
    </div>)}
  </div>;
}

export function BookingCartSummary({ cart, service, frequency, removeDate }: { cart: Cart; service: string; frequency: number; removeDate?(date: string): void }) {
  const dates = cart.items.flatMap(item => item.kind === 'daily' ? [item.date] : []);
  return <div className="booking-cart-summary" aria-live="polite">
    <dl className="booking-summary-field booking-summary-total"><dt>Valor Total</dt><dd data-booking-total data-design-name="Montante">{formatMoney(cart.totalCents)}</dd></dl>
    <div className="booking-summary-information-scroll" role="region" aria-label="Informações do agendamento" tabIndex={0} onKeyDown={horizontalScrollKeys}>
      <dl className="booking-summary-information">
        <div className="booking-summary-field"><dt>Pets selecionados</dt><dd data-booking-pet-count>{cart.petCount}</dd></div>
        <div className="booking-summary-field"><dt>{service === 'Creche' ? 'Frequência semanal' : `Datas selecionadas (${dates.length})`}</dt><dd>{service === 'Creche' ? `${frequency} ${frequency === 1 ? 'vez' : 'vezes'} por semana` : <BookingDates dates={dates} removeDate={removeDate} />}</dd></div>
        <div className="booking-summary-field"><dt>Valor por pet</dt><dd data-booking-subtotal>{formatMoney(cart.subtotalPerPetCents)}</dd></div>
      </dl>
    </div>
  </div>;
}
