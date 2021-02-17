Documentation and scripts for reference tracks available via TGG-viewer:

### Gencode:

https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=1032679709_0cw5CSR3uTIvedjA0A6B8WuAmDXj&clade=mammal&org=Human&db=hg38&hgta_group=genes&hgta_track=wgEncodeGencodeV36&hgta_table=wgEncodeGencodeCompV36&hgta_regionType=genome&position=chrX%3A15%2C560%2C138-15%2C602%2C945&hgta_outputType=primaryTable&hgta_outFileName=hg38_gencode_v36.knownGene.txt


### Segmental Duplications

https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=1032679709_0cw5CSR3uTIvedjA0A6B8WuAmDXj&clade=mammal&org=Human&db=hg38&hgta_group=rep&hgta_track=genomicSuperDups&hgta_table=0&hgta_regionType=genome&position=chrX%3A15%2C560%2C138-15%2C602%2C945&hgta_outputType=primaryTable&hgta_outFileName=hg38_genomicSuperDups.txt


### ClinGen:

Downloaded from https://search.clinicalgenome.org/kb/gene-dosage/ftp

wget ftp://ftp.clinicalgenome.org/ClinGen_region_curation_list_GRCh38.tsv
wget ftp://ftp.clinicalgenome.org/ClinGen%20recurrent%20CNV%20.bed%20file%20V1.1-hg38.bed

wget ftp://ftp.clinicalgenome.org/ClinGen_triplosensitivity_gene_GRCh38.bed
bedtools sort -i ClinGen_triplosensitivity_gene_GRCh38.bed | bgzip > ClinGen_triplosensitivity_gene_GRCh38.sorted.bed.gz
tabix ClinGen_triplosensitivity_gene_GRCh38.sorted.bed.gz

wget ftp://ftp.clinicalgenome.org/ClinGen_haploinsufficiency_gene_GRCh38.bed 
bedtools sort -i ClinGen_haploinsufficiency_gene_GRCh38.bed.gz | bgzip > ClinGen_haploinsufficiency_gene_GRCh38.sorted.bed.gz
tabix ClinGen_haploinsufficiency_gene_GRCh38.sorted.bed.zg


### GTEx tracks:

TODO docs


### Mappability tracks:

TODO docs