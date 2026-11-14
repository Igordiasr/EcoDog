// The API looks up exact LocalDate values. A month alone cannot establish a day.
export function goalReferenceForMonth(month, service, goals = []) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
    const dates = [...new Set(goals.filter(goal => goal.service === service && goal.period?.slice(0, 7) === month && /^\d{4}-\d{2}-\d{2}$/.test(goal.period)).map(goal => goal.period))];
    return dates.length === 1 ? dates[0] : null;
}
