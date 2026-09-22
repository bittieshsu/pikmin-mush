/* Conservative Libra 1440x3120 RGBA screencap classifier. No network or input. */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
typedef struct { int x,y,r,g,b; } Sample;
typedef struct { const char *name; int x,y; const Sample *samples; int count; } Template;
#include "ui-templates.h"
int main(int argc, char **argv) {
  if (argc != 2) { puts("unknown"); return 0; }
  FILE *f=fopen(argv[1],"rb");
  if (!f) { puts("unknown"); return 0; }
  uint32_t header[4];
  if(fread(header,4,4,f)!=4 || header[0]!=1440 || header[1]!=3120 || header[2]!=1) {
    fclose(f); puts("unknown"); return 0;
  }
  size_t n=1440u*3120u*4u;
  unsigned char *p=malloc(n);
  if(!p || fread(p,1,n,f)!=n || fgetc(f)!=EOF) {
    free(p); fclose(f); puts("unknown"); return 0;
  }
  fclose(f);
  const Template *found=NULL;
  for(size_t i=0;i<sizeof(templates)/sizeof(templates[0]);i++) {
    const Template *t=&templates[i]; int good=0;
    for(int j=0;j<t->count;j++) {
      Sample s=t->samples[j]; size_t k=((size_t)s.y*1440+s.x)*4;
      if(abs(p[k]-s.r)<=28 && abs(p[k+1]-s.g)<=28 && abs(p[k+2]-s.b)<=28) good++;
    }
    if(good*100>=t->count*96) {
      if(found && strcmp(found->name,t->name)!=0) { free(p); puts("unknown"); return 0; }
      found=t;
    }
  }
  if(found) printf("%s %d %d\n",found->name,found->x,found->y);
  else puts("unknown");
  free(p); return 0;
}
