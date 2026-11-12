'use client'
import { UniversalTool } from '@/app/components/UniversalTool'
import { tool } from './definition'
export default function Tool() {
  return <UniversalTool tool={tool} slug={tool.id} />
}
