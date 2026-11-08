# KPI “Pets previstos para hoje”

`GET /dashboard` now includes `petsPrevistosHoje`, an array with `servico`, `quantidadePrevista` and nullable `capacidadeDiaria`. The backend counts distinct pets with a calendar entry dated today and status `AGENDADO` or `CONFIRMADO`. It returns all three services, including zero when no pet is scheduled.

Daily capacities come from today's calendar row for Creche (`vagasCreche`) and Hotel (`vagasHotel`). The current data model has no Day Use capacity field, so the API returns `capacidadeDiaria: null` for Day Use; the UI still displays its predicted pet count and labels capacity as unavailable. If today's calendar row or a capacity field is missing, the count remains available and capacity stays null.

The existing `agendamentosPorServico` and `vagasPorServico` fields retain their monthly meaning and are not used by this KPI. The frontend expects `petsPrevistosHoje` in the response and rejects malformed counts or capacities instead of substituting values.
