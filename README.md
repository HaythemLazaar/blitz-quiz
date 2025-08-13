# Blitz-Quiz

A real-time multiplayer quiz application built with Next.js and Supabase, featuring buzzer-style gameplay for two competing teams.

## Features

- **Real-time synchronization** across all devices using Supabase Realtime
- **Multi-device support** with dedicated interfaces for teams and control
- **Buzzer system** with audio feedback and lockout mechanisms
- **Scoring system** with different point values for first and second attempts
- **Penalty system** for incorrect answers
- **Bilingual questions** (French and Arabic)
- **Responsive design** optimized for mobile and desktop

## Requirements

- **Supabase project** with realtime database capabilities
- **Environment variables** configured (see Setup section)
- **Minimum 3 devices** for optimal gameplay:
  - 1 device for Red Team buzzer
  - 1 device for Blue Team buzzer  
  - 1 device for referee/admin controls
  - 1 device/screen for score display (optional but recommended)

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

## How to Play

### Game Setup

1. **Red Team**: Connect to `/red` with a mobile device to use as the buzzer
2. **Blue Team**: Connect to `/blue` with a mobile device to use as the buzzer
3. **Referee/Admin**: Connect to `/controls` to manage the game
4. **Score Display**: Connect to `/` (root) to display scores on a big screen or projector

### Game Flow

1. **Start the Quiz**: The referee clicks "Démarrer le quiz" in the controls interface
2. **Question Display**: Questions appear simultaneously on all screens in both French and Arabic
3. **Buzzer Action**: Teams press their buzzer button when they know the answer
4. **Answer Evaluation**: The referee awards points or penalties based on the team's response:
   - **First attempt**: Full points (typically 7 points)
   - **Second attempt**: Reduced points (typically 3 points)
   - **Wrong answer**: Penalty (typically -2 points)
5. **Next Question**: The referee advances to the next question
6. **Game End**: The referee can end the quiz at any time

### Scoring System

- Questions have different point values for first and second attempts
- Teams are temporarily locked out after giving a wrong answer
- The buzzer system prevents multiple teams from answering simultaneously
- All scores are synchronized in real-time across all devices

## Technical Architecture

### Routes

- `/` - Main scoreboard display (for projection/big screen)
- `/red` - Red team buzzer interface
- `/blue` - Blue team buzzer interface  
- `/controls` - Referee/admin control panel

### Key Technologies

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Supabase** for real-time data synchronization
- **Tailwind CSS** for responsive styling
- **Audio API** for buzzer sound effects

### Real-time Features

- Instant score updates across all devices
- Buzzer state synchronization
- Question progression tracking
- Team lockout management

## Customization

### Adding Questions

Edit `app/questions.ts` to add or modify quiz questions:

```typescript
{
  number: 1,
  text: "Arabic question text",
  shortQuestionFr: "French question text",
  answer: "Expected answer",
  pointsFirstTry: 7,
  pointsSecondTry: 3,
  penalty: -2,
}
```

### Styling

The application uses Tailwind CSS with a dark/light theme system. Customize colors and styling in:
- `app/globals.css` - Global styles
- Component files - Component-specific styling

### Audio

Buzzer sound effects are stored in the `public/` directory:
- `buzzer.mp3` - Main buzzer sound
- `wrong.mp3` - Wrong answer sound
- `tickingbuzzer.mp3` - Timer sound

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed on any platform that supports Next.js:

```bash
npm run build
npm run start
```

## Development

### Project Structure

```
app/
├── page.tsx          # Main scoreboard
├── red/page.tsx      # Red team buzzer
├── blue/page.tsx     # Blue team buzzer
├── controls/page.tsx # Admin controls
├── questions.ts      # Quiz questions
├── supabaseRealtime.ts # Realtime logic
└── globals.css       # Global styles
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multiple devices
5. Submit a pull request

## Troubleshooting

### Common Issues

- **Realtime not working**: Check Supabase credentials and project settings
- **Audio not playing**: Ensure HTTPS is used in production (required for audio autoplay)
- **Sync issues**: Verify all devices are connected to the same network and Supabase project

### Support

For issues and questions, please open an issue on the GitHub repository.

## License

This project is open source and available under the MIT License.
