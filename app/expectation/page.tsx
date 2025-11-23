import { redirect } from 'next/navigation';

export default function ExpectationRedirectPage() {
  redirect('/correction#expectation-step');
}
