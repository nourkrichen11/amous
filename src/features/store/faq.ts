import type { DeliveryConfigView } from '@/features/cart/types'
import { formatTNDMillimes } from '@/lib/formatting/currency'

export type FaqItem = {
  /** Stable anchor id, also used by footer "Aide" links. */
  id: string
  question: string
  answer: string[]
}

/**
 * Footer FAQ. Answers only state what the storefront actually does today:
 * delivery figures come from the Payload DeliveryConfig global (the same values checkout
 * uses), and payment reflects the only method accepted by checkout (cash on delivery).
 * Policies that are not defined anywhere (quotes, warranty) are answered without commitments.
 */
export function buildFooterFaq(delivery: DeliveryConfigView): FaqItem[] {
  const deliveryAnswer: string[] = []

  if (delivery.homeDeliveryEnabled) {
    deliveryAnswer.push(
      delivery.supportedGovernorates.length > 0
        ? `La livraison à domicile est actuellement proposée dans les gouvernorats suivants : ${delivery.supportedGovernorates.join(', ')}.`
        : 'La livraison à domicile est proposée en Tunisie ; la disponibilité pour votre adresse est vérifiée lors de la commande.'
    )

    const fee = `Les frais de livraison sont de ${formatTNDMillimes(delivery.defaultDeliveryFee, 'fr')}`
    deliveryAnswer.push(
      typeof delivery.freeDeliveryThreshold === 'number' && delivery.freeDeliveryThreshold > 0
        ? `${fee}, offerts à partir de ${formatTNDMillimes(delivery.freeDeliveryThreshold, 'fr')} d'achat.`
        : `${fee}.`
    )

    if (delivery.estimatedDeliveryText?.trim()) {
      deliveryAnswer.push(delivery.estimatedDeliveryText.trim())
    }
  } else {
    deliveryAnswer.push("La livraison à domicile n'est pas disponible en ligne pour le moment. Contactez-nous pour étudier votre demande.")
  }

  return [
    { answer: deliveryAnswer, id: 'faq-livraison', question: 'Livrez-vous en Tunisie ?' },
    {
      answer: [
        'La disponibilité est indiquée sur chaque fiche produit : « En stock », « Stock limité » ou « Rupture de stock ».',
        'Pour une quantité importante, contactez-nous afin de vérifier le stock avant de commander.'
      ],
      id: 'faq-disponibilite',
      question: 'Comment savoir si un produit est disponible ?'
    },
    {
      answer: delivery.storePickupEnabled
        ? ['Oui. Choisissez « Retrait magasin » à l’étape Livraison de votre commande.']
        : ["Le retrait en magasin n'est pas encore proposé lors de la commande en ligne. Contactez-nous pour vérifier si un retrait est possible pour votre commande."],
      id: 'faq-retrait',
      question: 'Puis-je retirer ma commande en magasin ?'
    },
    {
      answer: ['Les commandes passées sur le site sont réglées par paiement à la livraison.'],
      id: 'faq-paiement',
      question: 'Quels sont les moyens de paiement ?'
    },
    {
      answer: ['Pour une demande de devis, contactez-nous par téléphone en précisant les références et les quantités souhaitées.'],
      id: 'faq-devis',
      question: 'Puis-je obtenir un devis pour mon entreprise ?'
    },
    {
      answer: [
        'Pour toute demande de retour, contactez-nous en indiquant votre numéro de commande.',
        'Les conditions de retour et de garantie dépendent du produit ; elles vous seront précisées par notre équipe.'
      ],
      id: 'faq-retours',
      question: 'Comment fonctionnent les retours et la garantie ?'
    }
  ]
}
