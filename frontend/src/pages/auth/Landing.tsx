import { Link } from 'react-router-dom'
import { Heart, Dumbbell, Users, BarChart3, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" strokeWidth={1.5} />
          </div>
          <span className="font-display text-xl text-foreground">Fitela</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/trainer/login">
            <Button variant="ghost" size="sm" className="px-2 sm:px-3">
              <span className="sm:hidden">Personal</span>
              <span className="hidden sm:inline">Sou Personal</span>
            </Button>
          </Link>
          <Link to="/student/login">
            <Button variant="primary" size="sm" className="px-2 sm:px-3">
              <span className="sm:hidden">Aluna</span>
              <span className="hidden sm:inline">Sou Aluna</span>
            </Button>
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:px-8 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-medium mb-5 sm:mb-6">
          <Heart className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
          <span>Treinamento especializado para gestantes</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight mb-4 sm:mb-6 max-w-3xl mx-auto">
          Cuide do seu corpo com segurança e amor
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          Plataforma completa para personal trainers especializados em gestantes e suas alunas.
          Treinos seguros, acompenho próximo, resultados reais.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Link to="/trainer/register" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Sou Personal Trainer <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </Link>
          <Link to="/student/register" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Sou Gestante / Pós-parto
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12 sm:px-8 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: Dumbbell,
              title: 'Treinos Personalizados',
              description:
                'Crie e envie treinos adaptados para gestantes e pós-parto com exercícios categorizados e seguros.',
            },
            {
              icon: Users,
              title: 'Gestão de Alunas',
              description:
                'Acompanhe a anamnese, histórico e evolução de cada aluna em um único lugar.',
            },
            {
              icon: BarChart3,
              title: 'Dashboard Inteligente',
              description:
                'Métricas de desempenho, feedbacks de treinos e visão geral do seu negócio em tempo real.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-5 sm:p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent mb-4">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="section-title mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
