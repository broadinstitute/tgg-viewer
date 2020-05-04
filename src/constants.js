
export const SUPPORTED_FILE_EXTENSIONS = {
  '.bigWig': 'coverage',

  '.junctions.bed': 'spliceJunctions',
  '.spliceJunctions.bed': 'spliceJunctions',
  '.junctions.bed.gz': 'spliceJunctions',
  '.spliceJunctions.bed.gz': 'spliceJunctions',

  '.bam': 'bam',
  '.cram': 'bam',

  '.vcf': 'vcf',
  '.vcf.gz': 'vcf',

  '.wig': 'wig',
  '.bedGraph': 'wig',

  /*
  '.bed': 'annotation',
  '.bed.gz': 'annotation',
  '.gff3': 'annotation',
  '.gtf': 'annotation',
  '.gtf.gz': 'annotation',
  '.genePred': 'annotation',
  '.bigBed': 'annotation',
   */
}

export const SJ_MOTIFS = ['GT/AG', 'CT/AC', 'GC/AG', 'CT/GC', 'AT/AC', 'GT/AT', 'non-canonical']
export const SJ_DEFAULT_COLOR_BY_NUM_READS_THRESHOLD = 5

export const GCNV_DEFAULT_HIGHLIGHT_COLOR = 'blue'
