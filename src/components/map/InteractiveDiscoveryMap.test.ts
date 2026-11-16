import test from 'node:test';
import assert from 'node:assert';
import { REGIONAL_HUBS } from './regionalHubs';

test('REGIONAL_HUBS contains exactly 10 corridors with valid coordinates and bounds', () => {
  assert.strictEqual(REGIONAL_HUBS.length, 10);
  REGIONAL_HUBS.forEach((hub) => {
    assert.ok(hub.id, 'Hub must have an id');
    assert.ok(hub.name, 'Hub must have a name');
    assert.ok(hub.tamilName, 'Hub must have a tamilName');
    assert.strictEqual(typeof hub.center[0], 'number', 'Latitude must be a number');
    assert.strictEqual(typeof hub.center[1], 'number', 'Longitude must be a number');
    // Tamil Nadu lat bounds approx 8 - 14, lng bounds approx 76 - 81
    assert.ok(hub.center[0] >= 8 && hub.center[0] <= 14, `${hub.name} lat must be within TN`);
    assert.ok(hub.center[1] >= 76 && hub.center[1] <= 81, `${hub.name} lng must be within TN`);
    assert.ok(hub.imageUrl.startsWith('https://'), `${hub.name} must have a valid image URL`);
  });
});

test('REGIONAL_HUBS corridor matching logic correctly handles district and locality boundaries', () => {
  const coimbatoreHub = REGIONAL_HUBS.find((h) => h.id === 'coimbatore')!;
  const pollachiHub = REGIONAL_HUBS.find((h) => h.id === 'pollachi')!;
  const ootyHub = REGIONAL_HUBS.find((h) => h.id === 'ooty')!;
  const hosurHub = REGIONAL_HUBS.find((h) => h.id === 'hosur')!;
  const trichyHub = REGIONAL_HUBS.find((h) => h.id === 'trichy')!;

  // Coimbatore vs Pollachi (both administratively Coimbatore district)
  assert.strictEqual(coimbatoreHub.matches('Coimbatore', 'Saravanampatti'), true);
  assert.strictEqual(coimbatoreHub.matches('Coimbatore', 'Pollachi Road, Mahalingapuram'), false);
  assert.strictEqual(pollachiHub.matches('Coimbatore', 'Pollachi Road, Mahalingapuram'), true);

  // Ooty / Nilgiris (The Nilgiris, Coonoor, Kotagiri)
  assert.strictEqual(ootyHub.matches('The Nilgiris', 'Coonoor'), true);
  assert.strictEqual(ootyHub.matches('Nilgiris', 'Kotagiri'), true);
  assert.strictEqual(ootyHub.matches('Ooty', 'Fernhill'), true);
  assert.strictEqual(ootyHub.matches('Coimbatore', 'Peelamedu'), false);

  // Hosur (Krishnagiri district)
  assert.strictEqual(hosurHub.matches('Krishnagiri', 'Bagalur Road, Hosur'), true);
  assert.strictEqual(hosurHub.matches('Krishnagiri', 'SIPCOT'), true);
  assert.strictEqual(hosurHub.matches('Chennai', 'OMR'), false);

  // Trichy (Trichy or Tiruchirappalli)
  assert.strictEqual(trichyHub.matches('Trichy', 'Thillai Nagar'), true);
  assert.strictEqual(trichyHub.matches('Tiruchirappalli', 'Srirangam'), true);
  assert.strictEqual(trichyHub.matches('Madurai', 'KK Nagar'), false);
});
