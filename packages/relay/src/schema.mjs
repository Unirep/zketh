import { nanoid } from 'nanoid'

export default [
  {
    name: 'Message',
    primaryKey: '_id',
    rows: [
      {
        name: '_id',
        type: 'String',
        default: () => nanoid(),
      },
      ['text', 'String'],
      ['timestamp', 'Int', { unique: true }],
    ],
  },
]
