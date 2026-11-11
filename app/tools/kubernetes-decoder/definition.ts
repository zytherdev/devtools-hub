import type { ToolDefinition } from '@/app/tools/types'

export const tool: ToolDefinition = {
  id: 'kubernetes-decoder',
  name: 'K8s Secret Decoder',
  description: 'Decode Kubernetes Secret data locally into plaintext stringData YAML. The output contains secrets in clear text.',
  icon: 'fa-solid fa-cubes',
  color: '#326ce5',
  badge: '',
  href: '/kubernetes-decoder',
  categoryId: 'database',
  status: 'implemented',
  exampleInput: `apiVersion: v1
kind: Secret
metadata:
  name: example-secret
  namespace: default
type: Opaque
data:
  username: YWRtaW4=
  password: c2FtcGxlLXZhbHVl
`,
  defaultOptions: {},
  outputExtension: 'yaml',
}
