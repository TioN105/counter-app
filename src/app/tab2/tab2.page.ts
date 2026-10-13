import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AlertController,
  ToastController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSelect,
  IonSelectOption
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonSelect,
    IonSelectOption
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly searchQuery = signal('');
  readonly sortType = signal('newest');

  readonly displayedCounters = computed(() => {
    // Vytvoříme kopii pole ze služby, abychom ho mohli řadit
    let result = [...this.counterService.counters()];

    // 1. Vyhledávání podle názvu
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(c => c.name.toLowerCase().includes(query));
    }

    // 2. Řazení
    const sort = this.sortType();
    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'valueDesc') {
      result.sort((a, b) => b.value - a.value);
    } else if (sort === 'valueAsc') {
      result.sort((a, b) => a.value - b.value);
    } else {
      // Od nejnovějšího (porovnáme datum)
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  });

  // Metody pro reakci na uživatelský vstup z HTML
  onSearch(event: any): void {
    this.searchQuery.set(event.detail.value || '');
  }

  onSort(event: any): void {
    this.sortType.set(event.detail.value);
  }

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    
    // Zobrazení toastu po smazání jedné položky
    const toast = await this.toastController.create({
      message: 'Záznam byl úspěšně odstraněn.',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async clear(): Promise<void> {
    // Zobrazení potvrzovacího dialogu před smazáním všeho
    const alert = await this.alertController.create({
      header: 'Opravdu smazat?',
      message: 'Tato akce trvale odstraní celou historii.',
      buttons: [
        {
          text: 'Zrušit',
          role: 'cancel',
        },
        {
          text: 'Smazat',
          role: 'destructive',
          handler: async () => {
            await this.counterService.clear();
            const toast = await this.toastController.create({
              message: 'Historie byla vymazána.',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          },
        },
      ],
    });

    await alert.present();
  }
}