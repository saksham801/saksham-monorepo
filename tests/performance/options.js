const type = __ENV.TEST_TYPE || 'smoke';
const target = Number(__ENV.TARGET_VUS || (type === 'smoke' ? 1 : 50));
const duration = __ENV.TEST_DURATION || (type === 'smoke' ? '1m' : '10m');

const ramp = __ENV.RAMP_DURATION || '2m';
const stages = type === 'smoke' ? [{ duration, target: Math.min(target, 2) }]
  : type === 'spike' ? [{ duration: '30s', target: Math.max(1, Math.ceil(target * 0.1)) }, { duration: '15s', target }, { duration: '45s', target }, { duration: '30s', target: 0 }]
  : type === 'soak' ? [{ duration: ramp, target }, { duration, target }, { duration: '2m', target: 0 }]
  : type === 'stress' || type === 'breakpoint' ? [
      { duration: '2m', target: Math.ceil(target * 0.1) }, { duration: '2m', target: Math.ceil(target * 0.25) },
      { duration: '2m', target: Math.ceil(target * 0.5) }, { duration: '2m', target: Math.ceil(target * 0.75) },
      { duration: '2m', target }, { duration: '2m', target: 0 },
    ]
  : [{ duration: ramp, target }, { duration, target }, { duration: '2m', target: 0 }];

export const options = {
  scenarios: { realistic_users: { executor: 'ramping-vus', startVUs: Math.min(target, 1), stages, gracefulRampDown: '30s', exec: 'realisticUserJourney' } },
  thresholds: {
    http_req_failed: [`rate<${__ENV.ERROR_RATE_THRESHOLD || '0.01'}`],
    http_req_duration: [`p(95)<${__ENV.P95_THRESHOLD || '1500'}`, `p(99)<${__ENV.P99_THRESHOLD || '3000'}`],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(75)', 'p(90)', 'p(95)', 'p(99)', 'p(99.9)'],
  discardResponseBodies: false,
  userAgent: 'saksham-site-k6-performance-test',
  tags: { test_type: type },
  ext: {},
};
