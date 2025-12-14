
export default function FreezeOverlay({freezeSecondsLeft}:{freezeSecondsLeft:number}) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/80">
          <div className="rounded-md bg-white px-6 py-4 shadow">
            <p className="text-sm">
              System frozen — reconnecting in {freezeSecondsLeft}s
            </p>
          </div>
        </div>
  )
}
