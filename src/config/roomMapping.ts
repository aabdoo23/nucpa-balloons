export function getRoomFromTeamName(teamName: string): string {
  // Extract the team number from the end of the team name
  const match = teamName.match(/\d+$/);
  if (!match) return '';
  
  const teamNumber = parseInt(match[0]);

  // Define the room mappings based on team number ranges
  const roomMappings = [
    { start: 1, end: 17, room: 'Lab-01' },
    { start: 18, end: 34, room: 'Lab-52' },
    { start: 35, end: 52, room: 'Lab-53' },
    { start: 53, end: 72, room: 'Lab-264' },
    { start: 73, end: 89, room: 'Lab-216-B' },
    { start: 90, end: 104, room: 'Lab-265' },
    { start: 105, end: 114, room: 'Lab-7' },
    { start: 115, end: 132, room: 'Lab-G29' },
    { start: 133, end: 150, room: 'Lab-G18' },
    { start: 151, end: 170, room: 'Lab-G17' }
  ];

  // Find the matching room based on team number
  const mapping = roomMappings.find(m => teamNumber >= m.start && teamNumber <= m.end);
  return mapping ? mapping.room : '';
} 